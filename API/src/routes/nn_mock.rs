use actix_web::{HttpResponse, web};
use crate::models::game::Game;
use crate::models::prediction::Prediction;
use crate::models::utils::ResponseType;

// send in prediction model and get back a prediction for win or loose, over or under, and the expected value
pub async fn predict(
    model: web::Json<Game>
) -> HttpResponse {
    let game = model.into_inner();
    let prediction = Prediction {
            team_won: game.team_one.to_string(),
            team_lose: game.team_two.to_string(),
            team_won_chance: 0.5,
            team_lose_chance: 0.5,
            over_under_chance: 0.5,
            expected_value: 0.45,
    };
    ResponseType::Ok(prediction).get_response()
}

// get current games being played today
pub async fn games() -> HttpResponse {
    let game = Game {
        team_one: "damon".to_string(),
        team_two: "shane".to_string(),
        over_under: 0.0,
        team_one_odds: 0.0,
        team_two_odds: 0.0
    };
    let game2 = Game {
        team_one: "alex".to_string(),
        team_two: "ryan".to_string(),
        over_under: 0.0,
        team_one_odds: 0.0,
        team_two_odds: 0.0
    };
    let game3 = Game {
        team_one: "connor".to_string(),
        team_two: "is lol man".to_string(),
        over_under: 0.0,
        team_one_odds: 0.0,
        team_two_odds: 0.0
    };
    let games = vec![game, game2, game3];
    ResponseType::Ok(games).get_response()
}


