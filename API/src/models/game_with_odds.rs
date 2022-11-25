use diesel::{Insertable, PgConnection, Queryable};
use serde::{Deserialize, Serialize};
use crate::{util::string::remove_quotes, models::daily_games::G};
use diesel::prelude::*;
use crate::models::schema::game;

#[derive(Deserialize, Serialize)]
pub struct GameWithOdds {
    pub game_id: String,
    pub venue: String,
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
            venue: "".to_string(),
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

    pub fn into_game(self) -> Game {
        Game {
            game_id: self.game_id,
            start_time: self.start_time,
            home_team_name: self.home_team_name,
            home_team_score: self.home_team_score,
            away_team_name: self.away_team_name,
            away_team_score: self.away_team_score,
            home_team_id: self.home_team_id as i32,
            away_team_id: self.away_team_id as i32
        }
    }

    pub fn is_finished(&self) -> bool {
        self.start_time == "Final"
    }
}


#[derive(Deserialize, Queryable, Serialize, Insertable)]
#[diesel(table_name = game)]
pub struct Game {
    pub game_id: String,
    pub start_time: String,
    pub home_team_name: String,
    pub home_team_score: String,
    pub away_team_name: String,
    pub away_team_score: String,
    pub home_team_id: i32,
    pub away_team_id: i32
}

impl Game {
    pub fn insert(&self, conn: &PgConnection) -> bool {
        diesel::insert_into(game::table)
            .values(self)
            .execute(conn)
            .is_ok()
    }

    pub fn is_saved(&self, conn: &mut PgConnection) -> Result<Game ,diesel::result::Error> {

        game::table
            .filter(game::game_id.eq(&self.game_id))
            .first::<Game>(conn)
    }

    pub fn save_all(games: &Vec<Game>, conn: &PgConnection) -> Result<(), diesel::result::Error> {
        for game in games {
            game.save(conn)?;
        }
        Ok(())
    }

    pub fn is_finished(&self) -> bool {
        self.start_time == "Final"
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
    pub home_team_odds: i32,
    pub away_team_odds: i32,
    pub home_team_opening_odds: i32,
    pub away_team_opening_odds: i32,
}
