use diesel::{Insertable, PgConnection, Queryable};
use serde::{Deserialize, Serialize};
use crate::{util::string::remove_quotes, models::daily_games::G};
use diesel::prelude::*;
use log::{error};
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
    #[serde(skip)]
    pub home_team_abbr: String,
    #[serde(skip)]
    pub away_team_abbr: String,
    pub away_team_score: String,
    #[serde(skip_deserializing)]
    pub time_left: Option<String>,
    pub home_team_id: i64,
    pub away_team_id: i64,
    pub odds: Vec<Odds>,
    pub home_team_injuries: Option<Vec<Injuries>>,
    pub away_team_injuries: Option<Vec<Injuries>>

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
            home_team_score: remove_quotes(&match_up.h.s),
            away_team_score: remove_quotes(&match_up.v.s),
            home_team_id: match_up.h.tid,
            away_team_id: match_up.v.tid,
            time_left: match_up.cl.as_ref().map(remove_quotes),
            home_team_abbr: remove_quotes(&match_up.h.ta),
            away_team_abbr: remove_quotes(&match_up.v.ta),
            odds: Vec::new(),
            home_team_injuries: None,
            away_team_injuries: None,
        }
    }

    pub fn into_saved_game(self, our_winner: Option<String>) -> SavedGame {
        let home_team_score = self.home_team_score.parse::<i32>().unwrap_or(0);
        let away_team_score = self.away_team_score.parse::<i32>().unwrap_or(0);
        SavedGame {
            game_id: self.game_id,
            date: self.date,
            winner: if home_team_score > away_team_score {
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

#[derive(Identifiable, Insertable, Queryable, Serialize, Deserialize)]
#[diesel(primary_key(game_id))]
#[diesel(table_name = saved_games)]
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

pub fn get_saved_games_by_date(date: &String, con: &mut PgConnection) -> Result<Vec<HistoryModel>, ApiError> {

    let games: Vec<SavedGame> = saved_games::table
        .filter(saved_games::date.eq(date))
        .load::<SavedGame>(con).unwrap();


    let mut games_with_injuries: Vec<(SavedGame, Vec<InjuryStore>)> = Vec::new();
    for game in games
    {

        let injs = get_injuries_by_game_id(&game.game_id, con)?;
        games_with_injuries.push((game, injs));
    }

    let history_models = games_with_injuries.into_iter().map(|(game, injuries)| { HistoryModel { game, injuries}}).collect::<Vec<HistoryModel>>();
    Ok(history_models)
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
#[derive(Serialize, Debug, Clone, Deserialize)]
pub struct Injuries {
    #[serde(skip)]
    #[serde(rename = "ID")]
    pub id: String,
    #[serde(skip)]
    #[serde(rename = "URL")]
    pub url: String,
    #[serde(skip)]
    pub firstname: String,
    #[serde(skip)]
    pub lastname: Option<String>,
    pub player: String,
    pub team: String,
    pub position: String,
    pub game_id: Option<String>,
    pub injury: String,
    pub status: String,
    #[serde(skip)]
    pub r_date: String,
}

impl Injuries {
    pub fn into_injury_store(self) -> InjuryStore {
        InjuryStore {
            player: self.player,
            team: self.team,
            position: self.position,
            game_id: self.game_id.unwrap_or_default(),
            injury: self.injury,
            status: self.status,
        }
    }
}
#[derive(Debug, Identifiable, Insertable, Queryable, Serialize, Deserialize)]
#[diesel(belongs_to(SavedGame, foreign_key = game_id))]
#[diesel(primary_key(game_id, player))]
#[diesel(table_name = injuries)]
pub struct InjuryStore {
    pub player: String,
    pub team: String,
    pub position: String,
    pub status: String,
    pub injury: String,
    pub game_id: String,
}

impl InjuryStore {
    pub fn insert(&self, conn: &mut PgConnection) -> bool {
        diesel::insert_into(injuries::table)
            .values(self)
            .execute(conn)
            .is_ok()
    }

    pub fn is_saved(&self, conn: &mut PgConnection) -> Result<bool, diesel::result::Error> {
        let s: i64 = injuries::table
            .filter(injuries::player.eq(&self.player))
            .filter(injuries::game_id.eq(&self.game_id))
            .count()
            .get_result::<i64>(conn)?;
        Ok(s > 0)
    }
}

fn get_injuries_by_game_id(game_id: &String, conn: &mut PgConnection) -> Result<Vec<InjuryStore>, ApiError> {
    match injuries::table
        .filter(injuries::game_id.eq(game_id))
        .load::<InjuryStore>(conn) {
        Ok(injuries) => Ok(injuries),
        Err(e) => {
            error!("Error getting injuries by game id: {}", e);
            Err(ApiError::DatabaseError)
        }
    }
}


#[derive(Serialize, Deserialize)]
pub struct HistoryModel {
    pub game: SavedGame,
    pub injuries: Vec<InjuryStore>,
}

