use actix_web::{HttpResponse, web};
use log::{error, info, warn};
use serde::de::DeserializeOwned;
use serde_derive::Deserialize;
use serde_derive::Serialize;
use crate::models::daily_games::{Match, DailyGames, V};
use crate::util::nn_helper::{get_model_data, call_model};
use crate::{util::string::remove_quotes};
use crate::models::api_error::ApiError;
use crate::models::game_odds::{GameOdds, OddsTable, OddsTableModel};
use crate::models::game_with_odds::GameWithOdds;
use crate::util::io_helper::directory_exists;

const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const DAILY_ODDS_URL: &str = "https://www.sportsbookreview.com/_next/data/lsfgDuEdROF0tkMgysmKK/betting-odds/nba-basketball/money-line/full-game.json?league=nba-basketball&oddsType=money-line&oddsScope=full-game";

#[derive(Deserialize, Serialize)]
pub struct PredictQueryParams {
    pub model_name: String,
}

pub async fn predict_all(
    params: web::Query<PredictQueryParams>,
) -> Result<HttpResponse, ApiError> {
    let inner = params.into_inner();
    let model_name = inner.model_name;
    let dir = std::env::var("MODEL_DIR").unwrap();
    let model_exist = directory_exists(&format!("{}/{}", dir, model_name));
    if !model_exist {
        error!("Could find model with the name {}", model_name);
        return Err(ApiError::ModelNotFound)
    }



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
    let prediction = call_model(&model_data, &tids, &model_name)?;
    Ok(HttpResponse::Ok().json(prediction))
}

pub async fn games() -> Result<HttpResponse, ApiError> {
    let game_odds = get_t_from_source::<DailyGames>(DAILY_GAMES_URL).await?;
    let games = game_odds.gs.g;
    let mut g_w_o = games.iter().map(GameWithOdds::from_g).collect::<Vec<GameWithOdds>>();
    let game_odds = get_t_from_source::<GameOdds>(DAILY_ODDS_URL).await?;
    // game_odds.page_props.odds_tables.retain(|go| go.is_some());
   let Some(nba_odds) = game_odds.page_props.odds_tables.into_iter().find(|g| g.league == "NBA") else {
        warn!("Returned early. No odds available.");
        return Ok(HttpResponse::Ok().json(g_w_o));
    };

    let odds_table_model = nba_odds.odds_table_model;

    for mut item in odds_table_model.game_rows.into_iter() {
        let game_view = item.game_view;
        let Some(mut game_to_edit) = g_w_o.iter_mut().find(|gwo| gwo.home_team_name == game_view.home_team.full_name || gwo.away_team_name == game_view.away_team.full_name) else {
            warn!("Couldnt find a game for {}", game_view.home_team.full_name);
            continue
        };

        game_to_edit.venue = game_view.venue_name;
        item.odds_views.retain(|o| o.is_some());
        game_to_edit.odds = item.odds_views.into_iter().map(|go| go.unwrap().into_odds()).collect();
    }

    Ok(HttpResponse::Ok().json(g_w_o))
}

async fn get_t_from_source<T: DeserializeOwned>(source: &str) -> Result<T, ApiError> {
    let response = match reqwest::get(source).await {
        Ok(res) => res,
        Err(err) => return {
            error!("Error has occurred while getting the request | {}", err.to_string());
            Err(ApiError::DependencyError)
        }
    };

    let response_body = match response.text().await {
        Ok(res) => res,
        Err(err) => return {
            error!("Error has occurred while getting the response body | {}", err.to_string());
            Err(ApiError::DeserializationError)
        }
    };

    let generic = match serde_json::from_str::<T>(&response_body) {
        Ok(t) => t,
        Err(err) => return {
            error!("Error has occurred attempting to deserialize the response body | {}", err.to_string());
            Err(ApiError::DeserializationError)
        }
    };
    Ok(generic)
}


