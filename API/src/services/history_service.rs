use std::collections::HashMap;
use std::ops::{DerefMut};
use actix_web::{ResponseError};
use diesel::{PgConnection, r2d2};
use diesel::r2d2::{ConnectionManager};
use log::{error, info, warn};
use reqwest::StatusCode;
use crate::models::game_with_odds::{GameWithOdds, InjuryStore, SavedGame};
use crate::models::prediction::Prediction;
use crate::routes::nn;
use crate::util::io_helper::{directory_exists, get_t_from_source};

const ONE_HOUR_IN_SECONDS: u64 = 60 * 60;
const FIFTEEN_MINUTES_IN_SECONDS: u64 = 60 * 15;

pub async fn run(
    pool: r2d2::Pool<ConnectionManager<PgConnection>>,
    model_dir: String
)
{
    loop
    {
        info!("Attempting to grab game for history");
        let response = match nn::games().await {
            Ok(response) => response,
            Err(error) => {
                match error.status_code() {
                    StatusCode::NOT_FOUND => {
                        info!("No games found for today, sleeping for 1 hour");
                        actix_rt::time::sleep(std::time::Duration::from_secs(ONE_HOUR_IN_SECONDS)).await;
                        continue;
                    }
                    _ => {
                        error!("Error occurred while trying to get games: {error}");
                        actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
                        continue;
                    }
                }
            }
        };

        let body = response.into_body();
        let Ok(body_bytes) = actix_web::body::to_bytes(body).await else {
            error!("Error occurred while trying to get the bytes of the response body");
            actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
            continue;
        };
        let Ok(string) = String::from_utf8(body_bytes.to_vec()) else {
            error!("Error occurred while converting bytes to string");
            actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
            continue;
        };
        let Ok(games) = serde_json::from_str::<Vec<GameWithOdds>>(string.as_str()) else {
            error!("Error occurred while trying to get games");
            actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
            continue;
        };


        let mut injury_map: HashMap<String, Vec<InjuryStore>> = HashMap::new();
        for game in games.iter() {
            let mut inj: Vec<InjuryStore> = vec![];
            let away_inj = game.away_team_injuries.clone();
            let home_inj = game.home_team_injuries.clone();

            if let Some(injuries) = home_inj {
                injuries.into_iter().map(|i| i.into_injury_store()).for_each(|i| inj.push(i));
            }
            if let Some(injuries) = away_inj {
                injuries.into_iter().map(|i| i.into_injury_store()).for_each(|i| inj.push(i));
            }
            injury_map.insert(game.game_id.clone(), inj);
        }


        if games.is_empty()
        {
            warn!("No games found, sleeping for {} seconds", ONE_HOUR_IN_SECONDS / 60);
            actix_rt::time::sleep(std::time::Duration::from_secs(ONE_HOUR_IN_SECONDS)).await;
            continue;
        }

        let all_games_finished = games.iter().all(|g| g.is_finished());


        if !all_games_finished
        {
            warn!("Not all games finished, sleeping for {} minutes", FIFTEEN_MINUTES_IN_SECONDS / 60);
            actix_rt::time::sleep(std::time::Duration::from_secs(FIFTEEN_MINUTES_IN_SECONDS)).await;
            continue;
        }

        if !directory_exists(&model_dir)
        {
            panic!("MODEL_DIR does not exist");
        }

        // walk the directory and get all the models
        let models: Vec<String> = std::fs::read_dir(&model_dir)
            .expect("Error reading directory")
            .map(|r|
                r.expect("Error reading directory")
                    .path()
                    .file_name()
                    .expect("Error getting file name")
                    .to_str()
                    .expect("Error converting to str")
                    .to_string()
            ).collect();


        for model in models
        {
            let games = games.clone();

            let prediction_url = format!("http://127.0.0.1:8080/sports/predict/all?model_name={model}");

            let Ok(predictions) = get_t_from_source::<Vec<Prediction>>(&prediction_url).await else {
                error!("Error occurred while trying to get predictions");
                actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
                continue;
            };


            let mut pooled_conn = match pool.get() {
                Ok(con) => con,
                Err(e) => {
                    error!("Error getting connection from pool | Error: {}", e);
                    continue;
                }
            };

            let conn = pooled_conn.deref_mut();
            let save_games_structs = games.into_iter().map(|g| {
                let Some(matched_prediction) = predictions.iter().find(|p| p.game_id == g.game_id) else {
                    error!("No prediction found {} vs {}", g.home_team_name, g.away_team_name);
                    return g.into_saved_game(None, &model);
                };
                g.into_saved_game(Some(matched_prediction), &model)
            }).collect::<Vec<SavedGame>>();

            let unsaved_games = save_games_structs.into_iter().filter(|gg| {
                match gg.is_saved(conn) {
                    Ok(b) => !b,
                    Err(e) => {
                        error!("Error has occurred while checking if game is saved | Error: {e}");
                        false
                    }
                }
            }).collect::<Vec<SavedGame>>();

            if unsaved_games.is_empty()
            {
                info!("No games to save, sleeping for 1 hour");
                actix_rt::time::sleep(std::time::Duration::from_secs(ONE_HOUR_IN_SECONDS)).await;
                continue;
            }

            let mut games_saved = 0;
            let mut injuries_saved = 0;
            let saved_games_len = unsaved_games.len();

            for game in unsaved_games
            {
                let game_saved = game.insert(conn);
                if !game_saved { error!("Failed to save {} vs {}. Will rerun in 1 hour", game.home_team_name, game.away_team_name) } else { games_saved += 1; }

                let Some(injuries) = injury_map.get(&game.game_id) else {
                    warn!("No injuries found for game {}", game.game_id);
                    continue;
                };

                for injury in injuries
                {
                    let Ok(saved) = injury.is_saved(conn) else {
                        error!("Error occurred while checking if injury is saved");
                        continue;
                    };
                    if saved { continue; }
                    let injury_saved = injury.insert(conn);
                    if !injury_saved { error!("Failed to save injury for game {}", game.game_id) } else { injuries_saved += 1; }
                }
            }

            let total_injuries = injury_map.iter().fold(0, |acc, (_, v)| acc + v.len());

            info!("Saved {}/{:?} games and {}/{:?} injuries. Sleeping for one hour.", games_saved, saved_games_len, injuries_saved, total_injuries);
        }
        actix_rt::time::sleep(std::time::Duration::from_secs(ONE_HOUR_IN_SECONDS)).await;
    }
}