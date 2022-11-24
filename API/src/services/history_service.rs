use std::ops::Deref;
use diesel::{PgConnection, r2d2};
use diesel::r2d2::{ConnectionManager, R2D2Connection};
use log::{error, info, warn};
use crate::models::game_with_odds::{Game, GameWithOdds};
use crate::util::io_helper::{get_t_from_source, write_to_csv};

pub async fn run(pool: r2d2::Pool<ConnectionManager<PgConnection>>)
{
    loop
    {
        info!("Attempting to grab game for history");
        let Ok(gwo) = get_t_from_source::<Vec<GameWithOdds>>("http://127.0.0.1:8080/sports/games").await else {
            error!("Error occurred while trying to get games");
            actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
            continue;
        };

        let games = gwo.into_iter().map(|go| go.into_game()).collect::<Vec<Game>>();


        if games.is_empty()
        {
            let one_hour_in_secs = 60 * 60;
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

        let mut conn = pool.get().unwrap();
        let conn = conn.deref();

        games.iter().filter(|game| {
            let saved = game.is_saved(conn).
            return saved.
        })






        info!("All games finished, saving to history");
        actix_rt::time::sleep(std::time::Duration::from_secs(60)).await;
   }
}