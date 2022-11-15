
use actix_web::HttpResponse;
use log::warn;
use {serde::{Deserialize, Serialize}};
use crate::models::daily_games::{DailyGames, Match, V};
use crate::models::game_odds::GameOdds;
use crate::models::game_with_odds::{GameWithOdds, Odds};
use crate::util::nn_helper::{call_model, get_model_data};


const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const DAILY_ODDS_URL: &str = "https://cdn.nba.com/static/json/liveData/odds/odds_todaysGames.json";

#[derive(Deserialize, Serialize)]
pub struct Test {
    pub date: String,
    pub match_up: String,
    pub home_team: String,
    pub away_team: String,
    pub outcome: String,
}

pub async fn predict() -> HttpResponse {
    let response = match reqwest::get(DAILY_GAMES_URL).await  {
        Ok(response) => response,
        Err(err) => return HttpResponse::InternalServerError().json(err.to_string()),
    };

    let Ok(response_body) = response.text().await else {
        return HttpResponse::InternalServerError().json("Failed to get response body of daily games");
    };


    let Ok(daily_games) = serde_json::from_str::<DailyGames>(&*response_body) else {
        return HttpResponse::InternalServerError().json("Couldnt deserialize daily games");
    };


    if daily_games.gs.g.is_empty() {
        return HttpResponse::NotFound().json("There are no games today");
    }
    let date = daily_games.gs.gdte.to_string().replace("\"", "");
    let tids: Vec<Match> = daily_games.gs.g.iter().map(|g|
        Match {
            home_team_id: g.h.tid,
            away_team_id: g.v.tid,
            away_team_name: format!("{} {}", g.v.tc.to_string().replace("\"",""), g.v.tn.to_string().replace("\"","")),
            home_team_name: format!("{} {}", g.h.tc.to_string().replace("\"",""), g.h.tn.to_string().replace("\"",""))
        }
    ).collect();


    let model_data = match get_model_data(&tids, &date).await  {
        Ok(data) => data,
        Err(e) => return HttpResponse::InternalServerError().json(e.to_string())
    };


    let prediction = call_model(&model_data, &tids);


    // return the prediction array
    HttpResponse::Ok().json(prediction)
}

pub async fn games() -> HttpResponse {
    let response = match reqwest::get(DAILY_ODDS_URL).await  {
        Ok(response) => response,
        Err(err) => return HttpResponse::InternalServerError().json(err.to_string()),
    };

    let Ok(response_body) = response.text().await else {
        return HttpResponse::InternalServerError().json("Failed to get resposne body of daily games");
    };

    let game_odds =  match serde_json::from_str::<GameOdds>(&*response_body) {
        Ok(res) => res,
        Err(err) => return HttpResponse::InternalServerError().json(err.to_string()),
    };

    let game = game_odds.games;
    let mut game_with_odds: Vec<GameWithOdds> = Vec::with_capacity(game.len());




    for (_, g) in game.iter().enumerate() {
        if g.markets.len() > 2 { continue; };
        let n_g = g.clone();



        let Some(book_odds) = n_g.markets.into_iter().find(|m| m.name == "2way") else {
            warn!("Two way odds not found for {}", &n_g.game_id);
            continue
        };

        if book_odds.books.iter().find(|bk| bk.country_code == "US".to_string()).is_none() {
            continue
        }

        game_with_odds.push(
            GameWithOdds {
                game_id: n_g.game_id,
                away_team_id: n_g.away_team_id.parse().unwrap_or(-1),
                home_team_id: n_g.home_team_id.parse().unwrap_or(-1),
                home_team_name: "".to_string(),
                away_team_name: "".to_string(),
                start_time: "".to_string(),
                // map over the g.odds and return a vector of odds
                odds: book_odds.books.iter().map(|book| {
                    let book = book.clone();
                    // just in case they would ever be out of order

                    let home_team_index = book.outcomes.iter().position(|o| o.type_field == "home").unwrap();
                    let away_team_index = book.outcomes.iter().position(|o| o.type_field == "away").unwrap();

                    return Odds {
                        book_name: book.name,
                        home_team_odds: book.outcomes[home_team_index].odds.parse::<f64>().unwrap_or(-1.0),
                        home_team_opening_odds: book.outcomes[home_team_index].opening_odds.parse::<f64>().unwrap_or(-1.0),
                        away_team_odds: book.outcomes[away_team_index].odds.parse::<f64>().unwrap(),
                        away_team_opening_odds: book.outcomes[away_team_index].opening_odds.parse::<f64>().unwrap_or(-1.0),
                        home_team_odds_trend: book.outcomes[home_team_index].odds_trend.to_string(),
                        away_team_odds_trend: book.outcomes[away_team_index].odds_trend.to_string(),
                    }
                }).collect()
            }
        )
    }



    let response = match reqwest::get(DAILY_GAMES_URL).await  {
        Ok(response) => response,
        Err(err) => return HttpResponse::InternalServerError().json(err.to_string()),
    };

    let Ok(response_body) = response.text().await else {
        return HttpResponse::InternalServerError().json("Failed to get response body of daily games");
    };


    let daily_games = match serde_json::from_str::<DailyGames>(&*response_body) {
        Ok(res) => res,
        Err(err) => return HttpResponse::InternalServerError().json(err.to_string()),
    };

    let games = daily_games.gs.g;

    for (_, g) in games.iter().enumerate() {

        let home_team_name = format!("{} {}", g.h.tc.to_string().replace("\"",""), g.h.tn.to_string().replace("\"",""));
        let away_team_name = format!("{} {}", g.v.tc.to_string().replace("\"",""), g.v.tn.to_string().replace("\"",""));
        let game_id = g.gid.to_string().replace("\"", "");

        let Some(game) = game_with_odds.iter_mut().find(|g| g.game_id == game_id) else {
            continue;
        };
        game.home_team_name = home_team_name;
        game.away_team_name = away_team_name;
        game.start_time = g.stt.to_string().replace("\"","")
    }

    HttpResponse::Ok().json(game_with_odds)




}



