use log::{error, info, warn};
use crate::models::game_with_odds::GameWithOdds;
use crate::util::io_helper::get_t_from_source;

pub async fn run()
{
    loop {
        info!("Attempting to grab game for history");
        let Ok(gwo) = get_t_from_source::<Vec<GameWithOdds>>("http://127.0.0.1:8080/sports/games").await else {
            error!("Error occurred while trying to get games");
            actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
            continue;
        };

        if gwo.is_empty() {
            let one_hour_in_secs = 60 * 60;
            warn!("No games found, sleeping for {} seconds", one_hour_in_secs);
            actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
            continue;
        }

        let all_games_finished = gwo.iter().all(|g| g.is_finished());

        if !all_games_finished {
            let fifteen_mins_in_secs = 60 * 15;
            warn!("Not all games finished, sleeping for {} seconds", fifteen_mins_in_secs);
            actix_rt::time::sleep(std::time::Duration::from_secs(fifteen_mins_in_secs)).await;
            continue;
        }




    }
}