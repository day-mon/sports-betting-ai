use actix_web::{HttpResponse, web};
use crate::models::daily_games::{DailyGames, Match};
use crate::models::game::Game;

const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";

pub async fn predict(
    // model: web::Json<Game>
) -> HttpResponse {

  let response = match reqwest::get(DAILY_GAMES_URL).await {
      Ok(res) => res,
      Err(_) => { return HttpResponse::InternalServerError().json("Booo") }
  };

    let response_body = match response.text().await {
        Ok(body) => body,
        Err(_) => { return HttpResponse::InternalServerError().json("boo v2") }
    };
    let daily_games: DailyGames = serde_json::from_str(&*response_body).unwrap();

    if daily_games.gs.g.is_empty() {
        return HttpResponse::NotFound().json("There are no games today")
    }

    let tids: Vec<Match> = daily_games.gs.g.iter().map(|g| Match { home_team_id: g.h.tid, away_team_id: g.v.tid } ).collect();

    HttpResponse::Ok().json(daily_games)
}