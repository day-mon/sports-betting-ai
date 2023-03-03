use std::fs;
use std::fs::File;
use std::ops::DerefMut;
use std::thread::sleep;
use std::time::Duration;

use diesel::r2d2::ConnectionManager;
use diesel::{r2d2, PgConnection};
use polars::export::ahash::HashSet;
use polars::export::chrono;
use polars::prelude::{CsvReader, SerReader};

use crate::models::daily_games::Match;
use crate::models::game_odds::{Boxscore, Game, GameOdds};
use crate::models::game_with_odds::{get_data_dates, SavedGame};
use crate::models::prediction::Prediction;
use crate::util::io_helper::get_t_from_source;
use crate::util::nn_helper::{call_model, get_model_data};

const TWENTY_FOUR_HOURS: Duration = Duration::from_secs(86400);
const ONE_HOUR: Duration = Duration::from_secs(3600);

pub async fn run(
    pool: r2d2::Pool<ConnectionManager<PgConnection>>,
    _model_dir: String,
    data_dir: String,
) {
    loop {
        let Ok(mut pooled_connection) = pool.get().inspect_err(|error| error!("Error has occurred while trying to get a connection, Error: {error}")) else {
            sleep(ONE_HOUR);
            continue;
        };

        let Ok(dates_in_fs) = fs::read_dir(&data_dir).inspect_err(|error| error!("Error {error}")) else {
            panic!("Couldnt read the data directory. Panicking becuase this or most likely not something that will be fixed by sleeping");
        };

        let dates_in_fs = dates_in_fs
            .map(|dir| {
                dir.unwrap()
                    .path()
                    .file_name()
                    .expect("Couldnt get the file name")
                    .to_str()
                    .expect("Couldnt convert the file name to a string")
                    .to_string()
                    .replace(".csv", "")
            })
            .collect::<Vec<String>>();

        let connection = pooled_connection.deref_mut();

        let Ok(database_date_models) = get_data_dates(connection) else {
            error!("Couldnt get the database dates");
            sleep(ONE_HOUR);
            continue;
        };

        let mut database_dates = database_date_models
            .iter()
            .flat_map(|date_model| date_model.dates.clone())
            .collect::<HashSet<String>>();

        database_dates.extend(dates_in_fs.clone());

        database_dates.retain(|date| {
            dates_in_fs.contains(date)
                && !database_date_models
                    .iter()
                    .all(|model| model.dates.contains(date))
        });

        if database_dates.is_empty() {
            info!("No games missing. Sleeping for 24 hours");
            sleep(TWENTY_FOUR_HOURS);
            continue;
        }

        if database_dates.len() == 1 {
            let date = database_dates.iter().next().unwrap();
            let Ok(date) = date.parse::<chrono::NaiveDate>().inspect_err(|error| error!("Error {error}")) else {
                error!("Couldnt parse the date");
                sleep(ONE_HOUR);
                continue;
            };
            if date > chrono::Utc::now().naive_utc().date() - chrono::Duration::days(1) {
                info!("No games missing. Sleeping for 24 hours");
                sleep(TWENTY_FOUR_HOURS);
                continue;
            }
        }

        let mut saved_games = 0;

        for date in database_dates {
            let file_name = format!("{data_dir}/{date}.csv");
            let Ok(file) = File::open(&file_name).inspect_err(|error| error!("Error has occurred while trying to acquire the file in directory ({file_name}), Error here: {error}")) else {
                continue;
            };

            let models = database_date_models
                .iter()
                .filter(|model| !model.dates.contains(&date))
                .map(|model| model.model_name.clone())
                .collect::<Vec<String>>();

            if models.is_empty() {
                info!("No models for {date}");
                continue;
            }

            let formatted_date = date.replace('-', "");
            let request_url = format!("https://api.actionnetwork.com/web/v1/scoreboard/nba?period=game&date={formatted_date}");
            let response = get_t_from_source::<GameOdds>(&request_url).await.unwrap();
            let Ok(dataframe) = CsvReader::new(file).has_header(true).finish().inspect_err(|error| error!("{error}")) else {
                continue;
            };
            let Ok(matches) = Match::from_dataframe(&dataframe, &response.games).inspect_err(|error| error!("{error}")) else {
                continue;
            };
            for model in models {
                info!("Getting information for {date} for the {model} model");
                let Ok(model_data) = get_model_data(None, &date, &model, &data_dir).await.inspect_err(|e| info!("{e}")) else {
                    continue;
                };
                let Ok(predictions) = call_model(&model_data, &matches, &model, &_model_dir).inspect_err(|e| error!("{e}")) else {
                    continue;
                };
                let prediction_len = predictions.len();

                for prediction in predictions {
                    let Some(game) = response.games.iter().find(|i| {
                        let Some(game_id) = i.id else {
                            error!("Couldnt find id in game");
                            return false;
                        };
                        game_id.to_string() == prediction.game_id
                    }) else {
                        error!("Couldnt find game id in response");
                        continue;
                    };
                    let Some(game_match) = matches.iter().find(|i| i.game_id == prediction.game_id) else {
                        error!("Couldnt find game id in matches");
                        continue;
                    };
                    let d = &game.boxscore.clone().unwrap();
                    let f = d.clone();
                    let Some(mgdto) = MissedGameDTO::new(&date, game_match, game, &model, &f, &prediction)
                        else {
                            error!("Couldnt create the missed game dto");
                            continue;
                        };
                    SavedGame::from_prediction(mgdto).insert(connection);
                }
                saved_games += prediction_len;
            }
        }
        info!("Saved {saved_games} backlogged games. Sleeping for 24 hours");
        sleep(TWENTY_FOUR_HOURS);
    }
}

pub struct MissedGameDTO<'a> {
    pub date: &'a String,
    pub game_match: &'a Match,
    pub model_name: &'a String,
    pub box_score: &'a Boxscore,
    pub prediction_outcome: String,
    pub prediction: &'a Prediction,
}

impl<'a> MissedGameDTO<'a> {
    pub fn new(
        date: &'a String,
        game_match: &'a Match,
        score: &Game,
        other_model_name: &'a String,
        box_score: &'a Boxscore,
        prediction: &'a Prediction,
    ) -> Option<Self> {
        let outcome = if other_model_name == "ou" {
            score.get_final_score()?
        } else {
            score.get_winner()?
        };
        Some(Self {
            date,
            game_match,
            model_name: other_model_name,
            prediction_outcome: outcome,
            box_score,
            prediction,
        })
    }
}