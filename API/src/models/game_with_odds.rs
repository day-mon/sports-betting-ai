use serde::{Deserialize, Serialize};
use crate::{util::string::remove_quotes, models::daily_games::G};
use crate::models::daily_games::Match;


#[derive(Deserialize, Serialize)]
pub struct GameWithOdds {
    pub game_id: String,
    pub start_time: String,
    pub home_team_name: String,
    pub home_team_score: String,
    pub away_team_name: String,
    pub away_team_score: String,
    pub home_team_id: i64,
    pub away_team_id: i64,
    pub odds: Vec<Odds>
}

impl GameWithOdds {
    pub fn from_g(match_up: &G) -> GameWithOdds {
        GameWithOdds {
            game_id: remove_quotes(&match_up.gid),
            start_time:  remove_quotes(&match_up.stt),
            home_team_name: format!("{} {}", remove_quotes(&match_up.h.tc), remove_quotes(&match_up.h.tn)),
            away_team_name: format!("{} {}", remove_quotes(&match_up.v.tc), remove_quotes(&match_up.v.tn)),
            home_team_id: match_up.h.tid,
            away_team_id: match_up.v.tid,
            home_team_score: remove_quotes(&match_up.h.s),
            away_team_score: remove_quotes(&match_up.v.s),
            odds: Vec::new()
        }
    }

    pub fn into_match(self) -> Match {
        Match {
            game_id: self.game_id,
            home_team_name: self.home_team_name,
            away_team_name: self.away_team_name,
            home_team_id: self.home_team_id,
            away_team_id: self.away_team_id,
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct Odds {
    pub book_name: String,
    pub home_team_odds: f64,
    pub away_team_odds: f64,
    pub home_team_odds_trend: String,
    pub away_team_odds_trend: String,
    pub home_team_opening_odds: f64,
    pub away_team_opening_odds: f64,
}
