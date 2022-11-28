use diesel::{Insertable, PgConnection, Queryable};
use serde::{Deserialize, Serialize};
use crate::{util::string::remove_quotes, models::daily_games::G};
use diesel::prelude::*;
use log::error;
use crate::models::api_error::ApiError;
use crate::models::schema::*;

#[derive(Deserialize, Serialize)]
pub struct GameWithOdds {
    pub game_id: String,
    pub date: String,
    pub venue: String,
    pub start_time: String,
    pub home_team_name: String,
    pub home_team_score: String,
    pub away_team_name: String,
    pub away_team_score: String,
    pub home_team_id: i64,
    pub away_team_id: i64,
    pub odds: Vec<Odds>,
}

impl GameWithOdds {
    pub fn from_g(match_up: &G, date: &str) -> GameWithOdds {
        GameWithOdds {
            game_id: remove_quotes(&match_up.gid),
            date: date.to_owned(),
            venue: "".to_string(),
            start_time: remove_quotes(&match_up.stt),
            home_team_name: format!("{} {}", remove_quotes(&match_up.h.tc), remove_quotes(&match_up.h.tn)),
            away_team_name: format!("{} {}", remove_quotes(&match_up.v.tc), remove_quotes(&match_up.v.tn)),
            home_team_id: match_up.h.tid,
            away_team_id: match_up.v.tid,
            home_team_score: remove_quotes(&match_up.h.s),
            away_team_score: remove_quotes(&match_up.v.s),
            odds: Vec::new(),
        }
    }

    pub fn into_saved_game(self, our_winner: Option<String>) -> SavedGame {
        SavedGame {
            game_id: self.game_id,
            date: self.date,
            winner: if self.home_team_score > self.away_team_score {
                self.home_team_name.clone()
            } else {
                self.away_team_name.clone()
            },
            home_team_name: self.home_team_name,
            home_team_score: self.home_team_score,
            away_team_name: self.away_team_name,
            away_team_score: self.away_team_score,
            our_projected_winner: our_winner
        }
    }

    pub fn is_finished(&self) -> bool {
        self.start_time == "Final"
    }
}

#[derive(Deserialize, Serialize)]
pub struct Odds {
    pub book_name: String,
    pub home_team_odds: i32,
    pub away_team_odds: i32,
    pub home_team_opening_odds: i32,
    pub away_team_opening_odds: i32,
}

#[derive(Insertable, Queryable, Serialize)]
#[table_name = "saved_games"]
pub struct SavedGame {
    pub game_id: String,
    pub home_team_name: String,
    pub home_team_score: String,
    pub away_team_name: String,
    pub away_team_score: String,
    pub winner: String,
    pub our_projected_winner: Option<String>,
    pub date: String
}

impl SavedGame {

    pub fn insert(&self, conn: &mut PgConnection) -> bool {
        diesel::insert_into(saved_games::table)
            .values(self)
            .execute(conn)
            .is_ok()
    }



    pub fn is_saved(&self, conn: &mut PgConnection) -> Result<bool, diesel::result::Error> {
        {
            let s: i64 = saved_games::table
                .filter(saved_games::game_id.eq(&self.game_id))
                .count()
                .get_result::<i64>(conn)?;
            Ok(s > 0)
        }

    }
}

pub fn get_saved_games_by_date(date: &String, con: &mut PgConnection) -> Result<Vec<SavedGame>, ApiError> {
    match saved_games::table
        .filter(saved_games::date.eq(date))
        .load::<SavedGame>(con) {
        Ok(games) => Ok(games),
        Err(e) => {
            error!("Error getting saved games: {}", e);
            Err(ApiError::DatabaseError)
        }
    }
}

pub fn get_data_dates(con: &mut PgConnection) -> Result<Vec<String>, ApiError> {
    match saved_games::table
        .select(saved_games::date)
        .distinct()
        .load::<String>(con) {
        Ok(dates) => Ok(dates),
        Err(e) => {
            error!("Error getting saved games dates: {}", e);
            Err(ApiError::DatabaseError)
        }
    }
}
