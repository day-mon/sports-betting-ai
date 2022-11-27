use std::ops::{DerefMut};
use diesel::{PgConnection, r2d2};
use diesel::r2d2::{ConnectionManager};
use log::{error, info, warn};
use crate::models::game_with_odds::{GameWithOdds, SavedGame};
use crate::models::prediction::Prediction;
use crate::util::io_helper::get_t_from_source;

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

        let Ok(predictions) = get_t_from_source::<Vec<Prediction>>("http://127.0.0.1:8080/sports/predict/all?model_name=v1").await else {
            error!("Error occurred while trying to get predictions");
            actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
            continue;
        };


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


        let mut pooled_conn = match pool.get() {
            Ok(con) => con,
            Err(e) =>  {
                error!("Error getting connection from pool | Error: {}", e);
                continue;
            }
        };

        let conn = pooled_conn.deref_mut();
        let save_games_structs = games.into_iter().map(|g| {
           let Some(p) = predictions.iter().find(|p| p.game_id == g.game_id) else {
               error!("No prediction found {} vs {}", g.home_team_name, g.away_team_name);
               return g.into_saved_game(None);
           };
            g.into_saved_game(Some(p.predicted_winner.clone()))
        }).collect::<Vec<SavedGame>>();

        let unsaved_games = save_games_structs.into_iter().filter(|gg| {
            return match gg.is_saved(conn) {
                Ok(b) => !b,
                Err(e) => {
                    error!("Error has occurred while checking if game is saved | Error: {}", e);
                    false
                }
            };
        }).collect::<Vec<SavedGame>>();

        if unsaved_games.is_empty()
        {
            info!("No games to save, sleeping for 1 hour");
            actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
            continue;
        }

        for game in unsaved_games
        {
            let game_saved = game.insert(conn);
            if !game_saved { error!("Failed to save {} vs {}. Will rerun in 1 hour", game.home_team_name, game.away_team_name) }
            else { info!("Saved {} vs {}", game.home_team_name, game.away_team_name) }
        }

        info!("All games finished. Sleeping for an hour");
        actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
   }
}