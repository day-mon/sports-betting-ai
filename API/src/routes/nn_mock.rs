use actix_web::{HttpResponse, web};
use log::error;
use polars::export::chrono::Utc;
use crate::models::api_error::ApiError;
use crate::models::daily_games::Match;
use crate::models::game_with_odds::GameWithOdds;
use crate::routes::nn::PredictQueryParams;
use crate::util::io_helper::directory_exists;
use crate::util::nn_helper::{call_model, get_model_data};

const GAMES_JSON: &str = r#"[{"game_id":"0022200256","start_time":"7:30 pm ET","home_team_name":"Philadelphia 76ers","home_team_score":"0","away_team_name":"Brooklyn Nets","away_team_score":"0","home_team_id":1610612755,"away_team_id":1610612751,"odds":[{"book_name":"FrancePari3","home_team_odds":3.65,"away_team_odds":1.33,"home_team_odds_trend":"up","away_team_odds_trend":"neutral","home_team_opening_odds":3.75,"away_team_opening_odds":1.32},{"book_name":"FanDuel","home_team_odds":3.6,"away_team_odds":1.313,"home_team_odds_trend":"down","away_team_odds_trend":"up","home_team_opening_odds":3.45,"away_team_opening_odds":1.333},{"book_name":"Betplay","home_team_odds":3.5,"away_team_odds":1.32,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":3.4,"away_team_opening_odds":1.32},{"book_name":"TabAustralia","home_team_odds":3.5,"away_team_odds":1.32,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":2.0,"away_team_opening_odds":1.85}]},{"game_id":"0022200257","start_time":"8:00 pm ET","home_team_name":"Memphis Grizzlies","home_team_score":"0","away_team_name":"Sacramento Kings","away_team_score":"0","home_team_id":1610612763,"away_team_id":1610612758,"odds":[{"book_name":"FrancePari3","home_team_odds":1.91,"away_team_odds":1.99,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":1.95,"away_team_opening_odds":1.95},{"book_name":"FanDuel","home_team_odds":1.847,"away_team_odds":2.0,"home_team_odds_trend":"down","away_team_odds_trend":"up","home_team_opening_odds":1.847,"away_team_opening_odds":2.0},{"book_name":"Betplay","home_team_odds":1.86,"away_team_odds":1.98,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":1.89,"away_team_opening_odds":1.93},{"book_name":"TabAustralia","home_team_odds":1.85,"away_team_odds":2.0,"home_team_odds_trend":"down","away_team_odds_trend":"up","home_team_opening_odds":1.77,"away_team_opening_odds":2.1}]},{"game_id":"0022200258","start_time":"9:00 pm ET","home_team_name":"Denver Nuggets","home_team_score":"0","away_team_name":"Detroit Pistons","away_team_score":"0","home_team_id":1610612743,"away_team_id":1610612765,"odds":[{"book_name":"FrancePari3","home_team_odds":1.45,"away_team_odds":2.95,"home_team_odds_trend":"neutral","away_team_odds_trend":"down","home_team_opening_odds":1.39,"away_team_opening_odds":3.25},{"book_name":"FanDuel","home_team_odds":1.465,"away_team_odds":2.8,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":1.37,"away_team_opening_odds":3.2},{"book_name":"Betplay","home_team_odds":1.42,"away_team_odds":2.95,"home_team_odds_trend":"down","away_team_odds_trend":"up","home_team_opening_odds":1.38,"away_team_opening_odds":3.1},{"book_name":"TabAustralia","home_team_odds":1.44,"away_team_odds":2.9,"home_team_odds_trend":"down","away_team_odds_trend":"up","home_team_opening_odds":1.26,"away_team_opening_odds":4.0}]},{"game_id":"0022200259","start_time":"10:00 pm ET","home_team_name":"Phoenix Suns","home_team_score":"0","away_team_name":"Los Angeles Lakers","away_team_score":"0","home_team_id":1610612756,"away_team_id":1610612747,"odds":[{"book_name":"FrancePari3","home_team_odds":1.24,"away_team_odds":4.6,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":1.36,"away_team_opening_odds":3.45},{"book_name":"FanDuel","home_team_odds":1.217,"away_team_odds":4.6,"home_team_odds_trend":"neutral","away_team_odds_trend":"up","home_team_opening_odds":1.313,"away_team_opening_odds":3.6},{"book_name":"Betplay","home_team_odds":1.23,"away_team_odds":4.3,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":1.35,"away_team_opening_odds":3.25},{"book_name":"TabAustralia","home_team_odds":1.22,"away_team_odds":4.5,"home_team_odds_trend":"up","away_team_odds_trend":"down","home_team_opening_odds":1.34,"away_team_opening_odds":3.4}]}]"#;


pub async fn games() -> HttpResponse {
    HttpResponse::Ok().json(GAMES_JSON)
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

    let Ok(game_odds) = serde_json::from_str::<Vec<GameWithOdds>>(GAMES_JSON) else {
        return Err(ApiError::DeserializationError)
    };

    let matches = game_odds.into_iter()
        .map(|m| m.into_match()).collect::<Vec<Match>>();

    let todays_date = Utc::today().naive_utc().to_string();

    let model_data = get_model_data(&matches, &todays_date).await?;
    let prediction = call_model(&model_data, &matches, &model_name)?;
    Ok(HttpResponse::Ok().json(prediction))

}

