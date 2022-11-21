use actix_web::HttpResponse;
use log::{error};
use serde::de::DeserializeOwned;
use crate::models::daily_games::{Match, DailyGames};
use crate::util::nn_helper::{get_model_data, call_model};
use crate::{util::string::remove_quotes};
use crate::models::api_error::ApiError;
use crate::models::game_odds::GameOdds;
use crate::models::game_with_odds::GameWithOdds;

const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const DAILY_ODDS_URL: &str = "https://cdn.nba.com/static/json/liveData/odds/odds_todaysGames.json";

pub async fn predict_all() -> Result<HttpResponse, ApiError> {
    let daily_games =  get_t_from_source::<DailyGames>(DAILY_GAMES_URL).await?;

    if daily_games.gs.g.is_empty() {
        return Err(ApiError::GamesNotFound)
    }

    let date = remove_quotes(&daily_games.gs.gdte);
    let tids: Vec<Match> = daily_games.gs.g.iter().map(|g|
        Match {
            game_id: remove_quotes(&g.gid),
            home_team_id: g.h.tid,
            away_team_id: g.v.tid,
            home_team_name: format!("{} {}", remove_quotes(&g.h.tc), remove_quotes(&g.h.tn)),
            away_team_name: format!("{} {}", remove_quotes(&g.v.tc), remove_quotes(&g.v.tn))
        }
    ).collect();

    let model_data = get_model_data(&tids, &date).await?;
    let prediction = call_model(&model_data, &tids);

    Ok(HttpResponse::Ok().json(prediction))
}

pub async fn games() -> Result<HttpResponse, ApiError> {
    let game_odds = get_t_from_source::<DailyGames>(DAILY_GAMES_URL).await?;
    let games = game_odds.gs.g;
    let mut g_w_o = games.iter().map(GameWithOdds::from_g).collect::<Vec<GameWithOdds>>();
    let game_odds = get_t_from_source::<GameOdds>(DAILY_ODDS_URL).await?;

    for game in game_odds.games {
        let Some(mut book_odds) = game.markets.into_iter().find(|mk| mk.has_2way()) else {
            continue;
        };

        if !book_odds.has_american_books() {
            continue;
        };

        book_odds.books.retain(|bk| bk.outcomes.is_some());

        let gwo_game_opt = g_w_o.iter_mut().find(|g| g.game_id == game.game_id);
        if gwo_game_opt.is_none() {
            error!("Game with odds not found for {}", &game.game_id);
            continue;
        }

        let gwo_game = gwo_game_opt.unwrap();
        gwo_game.odds = book_odds.books.iter().map(|bk| bk.to_odds()).collect()

    }

    Ok(HttpResponse::Ok().json(g_w_o))
}

async fn get_t_from_source<T: DeserializeOwned>(source: &str) -> Result<T, ApiError> {
    let response = match reqwest::get(source).await {
        Ok(res) => res,
        Err(err) => return {
            error!("Error has occurred... | {}", err.to_string());
            Err(ApiError::DependencyError)
        }
    };

    let response_body = match response.text().await {
        Ok(res) => res,
        Err(err) => return {
            error!("Error has occurred... | {}", err.to_string());
            Err(ApiError::DeserializationError)
        }
    };

    let generic = match serde_json::from_str::<T>(&response_body) {
        Ok(t) => t,
        Err(err) => return {
            error!("Error has occurred... | {}", err.to_string());
            Err(ApiError::DeserializationError)
        }
    };
    Ok(generic)
}


