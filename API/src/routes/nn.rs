use std::collections::HashMap;
use actix_web::{HttpResponse, web};
use serde_json::Value;
use crate::models::daily_games::{DailyGames, Match};
use crate::models::game::Game;
use crate::models::team_stats::TeamStats;

const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const TEAM_DATA_URL: &str = "https://upload.montague.im/r/BBOePC.json";


pub async fn predict(
    // model: web::Json<Game>
) -> HttpResponse {
    let Ok(response) =  reqwest::get(DAILY_GAMES_URL).await else {
        return HttpResponse::InternalServerError().json("Booo")
    };

    let Ok(response_body) = response.text().await else {
      return HttpResponse::InternalServerError().json("boo v2");
    };

    let daily_games: DailyGames = serde_json::from_str(&*response_body).unwrap();
    if daily_games.gs.g.is_empty() {
        return HttpResponse::NotFound().json("There are no games today");
    }

    let tids: Vec<Match> = daily_games.gs.g.iter().map(|g| Match { home_team_id: g.h.tid, away_team_id: g.v.tid }).collect();

    let Ok(response) =  reqwest::get(TEAM_DATA_URL).await else {
       return HttpResponse::InternalServerError().json("Booo");
    };

    let Ok(response_body) = response.text().await else {
         return HttpResponse::InternalServerError().json("boo v2");
    };

    let team_stats: TeamStats = serde_json::from_str(&*response_body).unwrap();

    let mut team_stats_map: HashMap<i64, &Vec<Vec<Value>>> = HashMap::new();
    for set in team_stats.result_sets.into_iter() {
        let stats = set.row_set[0].clone();
        println!("{:?}", stats)
    }




    HttpResponse::Ok().json(team_stats)
}