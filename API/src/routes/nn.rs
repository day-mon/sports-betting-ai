use std::ops::DerefMut;

use actix_web::{HttpResponse, web};
use diesel::{PgConnection, r2d2};
use diesel::r2d2::ConnectionManager;
use log::{error, warn};
use serde_derive::Deserialize;

use crate::util::string::remove_quotes;
use crate::{models::game_with_odds::GameWithOdds, util::io_helper::{directory_exists}};
use crate::models::api_error::ApiError;
use crate::models::daily_games::{DailyGames, Match};
use crate::models::game_odds::GameOdds;
use crate::models::game_with_odds::{get_data_dates, get_saved_games_by_date};
use crate::util::io_helper::get_t_from_source;
use crate::util::nn_helper::{call_model, get_model_data};

const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const DAILY_ODDS_URL: &str = "https://www.sportsbookreview.com/_next/data/lvqyIHzLaFraGFTybxNeO/betting-odds/nba-basketball/money-line/full-game.json?league=nba-basketball&oddsType=money-line&oddsScope=full-game";


#[derive(Deserialize)]
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
#[derive(Deserialize)]
pub struct HistoryQueryParams {
    pub date: String
}

pub async fn history(
     params: web::Query<HistoryQueryParams>,
     pool: web::Data<r2d2::Pool<ConnectionManager<PgConnection>>>,
) -> Result<HttpResponse, ApiError> {
    let param = params.into_inner();
    let date = param.date;
    let mut pooled_conn = match pool.get() {
        Ok(pool) => pool,
        Err(e) => {
            warn!("Could not get connection from pool {}", e);
            return Err(ApiError::DatabaseError)
        }
    };
    let connection = pooled_conn.deref_mut();
    let games = get_saved_games_by_date(&date, connection)?;
    Ok(HttpResponse::Ok().json(games))
}

pub async fn history_dates(
    pool: web::Data<r2d2::Pool<ConnectionManager<PgConnection>>>,
) -> Result<HttpResponse, ApiError> {
    let mut pooled_conn = match pool.get() {
        Ok(pool) => pool,
        Err(e) => {
            warn!("Could not get connection from pool {}", e);
            return Err(ApiError::DatabaseError)
        }
    };
    let connection = pooled_conn.deref_mut();
    let dates  = get_data_dates(connection)?;
    Ok(HttpResponse::Ok().json(dates))
}

pub async fn games() -> Result<HttpResponse, ApiError> {
    let game_odds = get_t_from_source::<DailyGames>(DAILY_GAMES_URL).await?;
    let games = game_odds.gs.g;
    let date = remove_quotes(&game_odds.gs.gdte);
    let mut g_w_o = games.iter().map(|g| GameWithOdds::from_g(g, &date)).collect::<Vec<GameWithOdds>>();
    let game_odds = match get_t_from_source::<GameOdds>(DAILY_ODDS_URL).await {
        Ok(odds) => odds,
        Err(_) => {
            warn!("Could not get odds");
            return Ok(HttpResponse::Ok().json(g_w_o))
        }

    };
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

