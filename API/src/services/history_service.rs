use std::collections::HashMap;
use std::ops::{DerefMut};
use diesel::{PgConnection, r2d2};
use diesel::r2d2::{ConnectionManager};
use log::{error, info, warn};
use crate::models::game_with_odds::{GameWithOdds, InjuryStore, SavedGame};
use crate::models::prediction::Prediction;
use crate::util::io_helper::{directory_exists, get_t_from_source};

pub async fn run(pool: r2d2::Pool<ConnectionManager<PgConnection>>)
{
    loop
    {
        info!("Attempting to grab game for history");
        let Ok(games) = get_t_from_source::<Vec<GameWithOdds>>("http://127.0.0.1:8080/sports/games").await else {
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


        let one_hour_in_secs = 60 * 60;
        if games.is_empty()
        {
            warn!("No games found, sleeping for {} seconds", one_hour_in_secs / 60);
            actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
            continue;
        }

        let all_games_finished = games.iter().all(|g| g.is_finished());


        if !all_games_finished
        {
            let fifteen_mins_in_secs = 60 * 15;
            warn!("Not all games finished, sleeping for {} minutes", fifteen_mins_in_secs / 60);
            actix_rt::time::sleep(std::time::Duration::from_secs(fifteen_mins_in_secs)).await;
            continue;
        }

        let model_dir = std::env::var("MODEL_DIR").unwrap_or_else(|_| panic!("MODEL_DIR not set"));
        if !directory_exists(&model_dir)
        {
            panic!("MODEL_DIR does not exist");
        }

        // walk the directory and get all the models
        let models: Vec<String> = std::fs::read_dir(&model_dir).unwrap().map(|r| r.unwrap().path().file_name().unwrap().to_str().unwrap().to_string()).collect();


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
                        error!("Error has occurred while checking if game is saved | Error: {}", e);
                        false
                    }
                }
            }).collect::<Vec<SavedGame>>();

            if unsaved_games.is_empty()
            {
                info!("No games to save, sleeping for 1 hour");
                actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
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
        actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
   }
}