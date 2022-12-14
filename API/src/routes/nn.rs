use std::ops::DerefMut;
use actix_web::{HttpResponse, web};
use diesel::{PgConnection, r2d2};
use diesel::r2d2::ConnectionManager;
use log::{debug, error, warn};
use redis::Client;
use serde_derive::Deserialize;

use crate::util::string::remove_quotes;
use crate::{models::game_with_odds::GameWithOdds, util::io_helper::{directory_exists}};
use crate::models::api_error::ApiError;
use crate::models::daily_games::{DailyGames, Match};
use crate::models::game_odds::GameOdds;
use crate::models::game_with_odds::{get_data_dates, get_model_win_rate, get_saved_games_by_date, Injuries};
use crate::models::prediction::Prediction;
use crate::util::io_helper::{get_from_cache, get_t_from_source, store_in_cache};
use crate::util::nn_helper::{call_model, get_model_data};

const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const DAILY_ODDS_URL: &str = "https://www.sportsbookreview.com/_next/data/lvqyIHzLaFraGFTybxNeO/betting-odds/nba-basketball/money-line/full-game.json?league=nba-basketball&oddsType=money-line&oddsScope=full-game";
const DAILY_INJURIES_URL: &str = "https://www.rotowire.com/basketball/tables/injury-report.php?team=ALL&pos=ALL";

#[derive(Deserialize)]
pub struct PredictQueryParams {
    pub model_name: String,
    pub game_date: Option<String>
}

pub async fn predict_all(
    params: web::Query<PredictQueryParams>,
    redis: web::Data<Option<Client>>
) -> Result<HttpResponse, ApiError> {
    let inner = params.into_inner();
    let model_name = inner.model_name;
    let dir = std::env::var("MODEL_DIR").map_err(|error| {
        error!("Error while attempting to get model directory env variable. This should've never happened?. Error: {}", error);
        ApiError::Unknown
    })?;

    if !directory_exists(&format!("{}/{}", dir, model_name)) {
        error!("Could find model with the name {}", model_name);
        return Err(ApiError::ModelNotFound)
    }


    let daily_games = get_t_from_source::<DailyGames>(DAILY_GAMES_URL).await?;

    if daily_games.gs.g.is_empty() {
        return Err(ApiError::GamesNotFound)
    }

    let game_key = &daily_games.gs.g.iter().map(|gm| remove_quotes(&gm.gid)).collect::<Vec<String>>().join("_");
    let prediction_key = format!("{}:{}", model_name, game_key);

    let client = redis.into_inner();
    if let Some(cached_response) = get_from_cache::<Vec<Prediction>>(&client, &prediction_key) {
        debug!("Cache Hit!");
        return Ok(HttpResponse::Ok().json(cached_response))
    }

    debug!("Cache Miss");


    let date = remove_quotes(&daily_games.gs.gdte);

    let matches: Vec<Match> = daily_games.gs.g.into_iter().map(Match::from_game).collect();
    let model_data = get_model_data(&matches, &date, &model_name).await?;
    let prediction = call_model(&model_data, &matches, &model_name)?;
    store_in_cache(&client, &prediction_key, &prediction);
    Ok(HttpResponse::Ok().json(prediction))
}
#[derive(Deserialize)]
pub struct HistoryQueryParams {
    pub date: String,
    pub model_name: String
}

pub async fn history(
     params: web::Query<HistoryQueryParams>,
     pool: web::Data<r2d2::Pool<ConnectionManager<PgConnection>>>,
) -> Result<HttpResponse, ApiError> {
    let params = params.into_inner();
    let mut pooled_conn = pool.get().map_err(|error| {
        warn!("Could not get connection from pool. Error: {}", error);
        ApiError::DatabaseError
    })?;
    let connection = pooled_conn.deref_mut();
    let games =  get_saved_games_by_date(&params, connection)?;

    Ok(HttpResponse::Ok().json(games))
}

pub async fn history_dates(
    pool: web::Data<r2d2::Pool<ConnectionManager<PgConnection>>>,
) -> Result<HttpResponse, ApiError> {
    let mut pooled_conn = pool.get().map_err(|error| {
        warn!("Could not get connection from pool. Error: {}", error);
        ApiError::DatabaseError
    })?;
    let connection = pooled_conn.deref_mut();
    let dates = get_data_dates(connection)?;
    Ok(HttpResponse::Ok().json(dates))
}

#[derive(Deserialize)]
pub struct ModelAccuracy {
    pub model_name: String
}

pub async fn model_accuracy(
    params: web::Query<ModelAccuracy>,
    pool: web::Data<r2d2::Pool<ConnectionManager<PgConnection>>>,
) -> Result<HttpResponse, ApiError> {
    let dir = std::env::var("MODEL_DIR").map_err(|error| {
        error!("Error while attempting to get model directory env variable. This should've never happened?. Error: {}", error);
        ApiError::Unknown
    })?;
    let inner_params = params.into_inner();
    let model_name = inner_params.model_name;

    if !directory_exists(&format!("{}/{}", dir, model_name)) {
        error!("Could find model with the name {}", model_name);
        return Err(ApiError::ModelNotFound)
    }

    if model_name ==  *"ou" {
        return Ok(HttpResponse::Ok().json("Cannot get winrate for over/under model"))
    }

    let mut pooled_conn = pool.get().map_err(|error| {
        warn!("Could not get connection from pool. Error: {}", error);
        ApiError::DatabaseError
    })?;

    let connection = pooled_conn.deref_mut();

    let perc = get_model_win_rate(&model_name, connection)?;
    Ok(HttpResponse::Ok().json(perc))

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
            debug!("Couldnt find a game for {}", game_view.home_team.full_name);
            continue
        };

        game_to_edit.venue = game_view.venue_name;
        item.odds_views.retain(|o| o.is_some());
        game_to_edit.odds = item.odds_views.into_iter().map(|go| go.unwrap().into_odds()).collect();
    }

    let Ok(injuries) = get_t_from_source::<Vec<Injuries>>(DAILY_INJURIES_URL).await else{
        warn!("Could not get injuries");
        return Ok(HttpResponse::Ok().json(g_w_o))
    };


    for mut game in g_w_o.iter_mut() {
        let mut home_injuries = injuries.iter().filter(|&tm| tm.team == game.home_team_abbr).cloned().collect::<Vec<Injuries>>();
        let mut away_injuries = injuries.iter().filter(|&tm| tm.team == game.away_team_abbr).cloned().collect::<Vec<Injuries>>();

        home_injuries.iter_mut().for_each(|hi| hi.game_id = Some(game.game_id.clone()));
        away_injuries.iter_mut().for_each(|ai| ai.game_id = Some(game.game_id.clone()));


        game.home_team_injuries = Some(home_injuries);
        game.away_team_injuries = Some(away_injuries);
    }

    Ok(HttpResponse::Ok().json(g_w_o))
}

