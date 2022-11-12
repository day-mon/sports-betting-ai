
use actix_web::HttpResponse;
use polars::export::num::ToPrimitive;
use polars::prelude::{DateType, Field, Schema};
use tensorflow::{SavedModelBundle, SessionOptions, SessionRunArgs, Tensor};
use {serde::{Deserialize, Serialize}};
use crate::models::daily_games::{DailyGames, Match};
use crate::util::nn_helper::{call_model, get_model_data};


const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";


#[derive(Deserialize, Serialize)]
pub struct Test {
    pub date: String,
    pub match_up: String,
    pub home_team: String,
    pub away_team: String,
    pub outcome: String,
}





pub async fn predict() -> HttpResponse {


    let Ok(response) = reqwest::get(DAILY_GAMES_URL).await else {
        return HttpResponse::InternalServerError().json("Booo");
    };

    let Ok(response_body) = response.text().await else {
        return HttpResponse::InternalServerError().json("boo v2");
    };


    let Ok(daily_games) = serde_json::from_str::<DailyGames>(&*response_body) else {
        return HttpResponse::InternalServerError().json("boo v3");
    };


    if daily_games.gs.g.is_empty() {
        return HttpResponse::NotFound().json("There are no games today");
    }
    let date = daily_games.gs.gdte.to_string().replace("\"", "");
    let tids: Vec<Match> = daily_games.gs.g.iter().map(|g| Match { home_team_id: g.h.tid, away_team_id: g.v.tid, away_team_name: format!("{} {}", g.v.tc.to_string().replace("\"",""), g.v.tn.to_string().replace("\"","")), home_team_name: format!("{} {}", g.h.tc.to_string().replace("\"",""), g.h.tn.to_string().replace("\"",""))}).collect();


    let model_data = match  get_model_data(&tids, &date).await  {
        Ok(data) => data,
        Err(e) => return HttpResponse::InternalServerError().json(e.to_string())
    };


    let prediction = call_model(&model_data, &tids);


    // return the prediction array
    HttpResponse::Ok().json(prediction)
}



