
use std::collections::BTreeSet;
use std::ops::{DerefMut, Not};
use actix_web::{HttpResponse, web};
use diesel::{PgConnection, r2d2};
use diesel::r2d2::ConnectionManager;
use log::{debug, error, warn};
use redis::Client;
use serde_derive::Deserialize;


use crate::{models::game_with_odds::GameWithOdds, util::io_helper::{directory_exists}};
use crate::models::api_error::ApiError;
use crate::models::daily_games::{DailyGames, Match};
use crate::models::game_odds::GameOdds;
use crate::models::game_with_odds::{get_data_dates, get_model_win_rate, get_saved_games_by_date, Injuries, Odds};
use crate::models::prediction::Prediction;
use crate::util::io_helper::{get_from_cache, get_t_from_source, store_in_cache};
use crate::util::nn_helper::{call_model, get_model_data};

const DAILY_GAMES_URL: &str = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";
const DAILY_INJURIES_URL: &str = "https://www.rotowire.com/basketball/tables/injury-report.php?team=ALL&pos=ALL";

#[derive(Deserialize)]
pub struct PredictQueryParams {
    pub model_name: String,
    pub ignore_cache: Option<bool>,
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

    if !directory_exists(&format!("{dir}/{model_name}")) {
        error!("Could find model with the name {}", model_name);
        return Err(ApiError::ModelNotFound)
    }

    let daily_games = get_t_from_source::<DailyGames>(DAILY_GAMES_URL).await?;

    // this is kinda yikes but it works /shrug
    let game_key = daily_games.scoreboard.games.iter().map(|game| game.game_id.clone()).collect::<Vec<String>>().join("_").split('_').flat_map(str::parse::<u64>).collect::<BTreeSet<_>>();
    let prediction_key = format!("{}:{:?}:{}", model_name, game_key, daily_games.scoreboard.game_date);
    let bypass_cache = ((inner.ignore_cache.is_none()) || (inner.ignore_cache.is_some() && !inner.ignore_cache.unwrap())).not();
    let client = redis.into_inner();

    if !bypass_cache
    {
        if let Some(cached_response) = get_from_cache::<Vec<Prediction>>(&client, &prediction_key) {
            debug!("Cache Hit!");
            return Ok(HttpResponse::Ok().json(cached_response))
        }
    }

    debug!("Cache Miss");

    let date = &daily_games.scoreboard.game_date;

    let matches: Vec<Match> = daily_games.scoreboard.games.into_iter().map(Match::from_game).collect();
    let model_data = get_model_data(&matches, date, &model_name).await?;
    let prediction = call_model(&model_data, &matches, &model_name)?;
    if !bypass_cache { store_in_cache(&client, &prediction_key, &prediction); }

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
    let games = get_saved_games_by_date(&params, connection)?;

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

    if !directory_exists(&format!("{dir}/{model_name}")) {
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


    let games = game_odds.scoreboard.games;

    if games.is_empty() {
        return Err(ApiError::GamesNotFound)
    }
    let date = game_odds.scoreboard.game_date
        .replace('-', "");
    let mut g_w_o = games.iter().map(|g| GameWithOdds::from_g(g, &date)).collect::<Vec<GameWithOdds>>();

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

    let daily_odds_url = format!("https://api.actionnetwork.com/web/v1/scoreboard/nba?period=game&bookIds=255,280,68,246,264,74,1906,76&date={date}");

    let game_odds = match get_t_from_source::<GameOdds>(daily_odds_url.as_str()).await {
        Ok(odds) => odds,
        Err(_) => {
            warn!("Could not get odds");
            return Ok(HttpResponse::Ok().json(g_w_o))
        }
    };

    if game_odds.games.is_empty() {
        warn!("Returned early. No odds available.");
        return Ok(HttpResponse::Ok().json(g_w_o));
    }

    let ids_to_skip = [15, 30, 264, 110, 75];
    for game in game_odds.games.into_iter() {

        let teams_abrv = game.teams.iter().map(|g| g.abbr.clone())
            .collect::<Vec<String>>();
        let Some (game_to_edit) = g_w_o.iter_mut().find(|gwo| teams_abrv.contains(&gwo.away_team_abbr) || teams_abrv.contains(&gwo.home_team_abbr)) else {
            debug!("Couldnt find a game for {} vs {}", teams_abrv[0], teams_abrv[1]);
            continue
        };
        game_to_edit.odds = game.odds.into_iter()
            .skip_while(|o| ids_to_skip.contains(&o.book_id))
            .map(|i| i.into_odds())
            .collect::<Vec<Odds>>();

    }

    Ok(HttpResponse::Ok().json(g_w_o))
}

