use crate::models::api_error::ApiError;
use crate::models::daily_games::Game;
use crate::models::prediction::Prediction;
use crate::models::schema::saved_games::model_name;
use crate::models::schema::*;
use crate::routes::nn::HistoryQueryParams;
use crate::services::missed_games_service::MissedGameDTO;
use diesel::dsl::sql;
use diesel::prelude::*;
use diesel::sql_types::{Bool, Float8};
use diesel::{Insertable, PgConnection, Queryable};
use log::error;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;

#[derive(Deserialize, Serialize, Clone)]
pub struct GameWithOdds {
    pub game_id: String,
    pub date: String,
    pub game_status: String,
    pub start_time: String,
    pub home_team_name: String,
    pub home_team_score: String,
    pub away_team_name: String,
    pub home_team_record: (i64, i64),
    pub away_team_record: (i64, i64),
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
    pub away_team_injuries: Option<Vec<Injuries>>,
}

impl GameWithOdds {
    pub fn from_g(match_up: &Game, date: &str) -> GameWithOdds {
        GameWithOdds {
            game_id: match_up.game_id.clone(),
            date: date.to_owned(),
            game_status: match_up.game_status_text.clone(),
            home_team_record: (match_up.home_team.wins, match_up.home_team.losses),
            away_team_record: (match_up.away_team.wins, match_up.away_team.losses),
            start_time: match_up.game_et.clone(),
            home_team_name: format!(
                "{} {}",
                &match_up.home_team.team_city, &match_up.home_team.team_name
            ),
            away_team_name: format!(
                "{} {}",
                &match_up.away_team.team_city, &match_up.away_team.team_name
            ),
            home_team_score: match_up.home_team.score.to_string(),
            away_team_score: match_up.away_team.score.to_string(),
            home_team_id: match_up.home_team.team_id,
            away_team_id: match_up.away_team.team_id,
            time_left: Some(match_up.game_clock.clone()),
            home_team_abbr: match_up.home_team.team_tricode.clone(),
            away_team_abbr: match_up.away_team.team_tricode.clone(),
            odds: vec![],
            home_team_injuries: None,
            away_team_injuries: None,
        }
    }

    pub fn into_saved_game(
        self,
        our_prediction: Option<&Prediction>,
        saved_model_name: &str,
    ) -> SavedGame {
        let home_team_score = self.home_team_score.parse::<i32>().unwrap_or(0);
        let away_team_score = self.away_team_score.parse::<i32>().unwrap_or(0);

        let prediction = our_prediction.map(|prediction| prediction.prediction.clone());

        let confidence = match our_prediction {
            Some(prediction) => prediction.confidence.map(|confidence| confidence as f64),
            None => None,
        };

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
            model_name: saved_model_name.to_owned(),
            confidence,
            prediction,
        }
    }

    pub fn is_finished(&self) -> bool {
        self.game_status.contains("Final")
    }
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Odds {
    pub book_name: String,
    pub home_team_odds: i32,
    pub away_team_odds: i32,
    pub predicted_score: f64,
}

#[derive(Identifiable, Insertable, Queryable, Serialize, Deserialize, Debug)]
#[diesel(primary_key(game_id, model_name))]
#[diesel(table_name = saved_games)]
pub struct SavedGame {
    pub game_id: String,
    pub home_team_name: String,
    pub home_team_score: String,
    pub away_team_name: String,
    pub away_team_score: String,
    pub winner: String,
    pub prediction: Option<String>,
    pub date: String,
    pub model_name: String,
    pub confidence: Option<f64>,
}

impl SavedGame {
    pub fn from_prediction(missed_game_dto: MissedGameDTO) -> Self {
        SavedGame {
            game_id: missed_game_dto.prediction.game_id.clone(),
            home_team_name: missed_game_dto.game_match.home_team_name.clone(),
            home_team_score: missed_game_dto.box_score.total_home_points.to_string(),
            away_team_name: missed_game_dto.game_match.away_team_name.clone(),
            away_team_score: missed_game_dto.box_score.total_away_points.to_string(),
            winner: if missed_game_dto.box_score.total_home_points
                > missed_game_dto.box_score.total_away_points
            {
                missed_game_dto.game_match.home_team_name.clone()
            } else {
                missed_game_dto.game_match.away_team_name.clone()
            },
            prediction: Some(missed_game_dto.prediction.prediction.clone()),
            date: missed_game_dto.date.clone(),
            model_name: missed_game_dto.model_name.clone(),
            confidence: missed_game_dto
                .prediction
                .confidence
                .map(|pred| pred as f64),
        }
    }
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
                .filter(saved_games::model_name.eq(&self.model_name))
                .count()
                .get_result::<i64>(conn)?;
            Ok(s > 0)
        }
    }
}

pub fn get_model_win_rate(
    other_model_name: &str,
    conn: &mut PgConnection,
) -> Result<f64, ApiError> {
    let percentage_correct: f64 = if other_model_name == "ou" {
        let select = "CAST(AVG(ABS((home_team_score::int + away_team_score::int) - prediction::int)) AS FLOAT) AS avg_score_difference";
        saved_games::table
            .select(sql::<Float8>(select))
            .filter(sql::<Bool>("prediction ~ '^\\d+$'"))
            .filter(model_name.eq(other_model_name))
            .get_result(conn)
            .map_err(|error| {
                error!(
                    "Error occurred while getting win rate for model {}: {}",
                    other_model_name, error
                );
                ApiError::DatabaseError
            })?
    } else {
        let select = format!("CAST(COUNT(prediction) AS FLOAT) / (SELECT COUNT(*) FROM saved_games WHERE model_name = '{}') * 100 AS percentage_correct", other_model_name);
        saved_games::table
            .select(sql::<Float8>(select.as_str()))
            .filter(sql::<Bool>("prediction = winner"))
            .filter(model_name.eq(other_model_name))
            .get_result(conn)
            .map_err(|error| {
                error!(
                    "Error occurred while getting win rate for model {}: {}",
                    other_model_name, error
                );
                ApiError::DatabaseError
            })?
    };

    Ok(percentage_correct)
}

pub fn get_saved_games_by_date(
    params: &HistoryQueryParams,
    con: &mut PgConnection,
) -> Result<Vec<HistoryModel>, ApiError> {
    let date = &params.date;
    let other_model_name = &params.model_name;

    let games: Vec<SavedGame> = saved_games::table
        .filter(saved_games::date.eq(date))
        .filter(model_name.eq(other_model_name))
        .load::<SavedGame>(con)
        .map_err(|error| {
            error!("{error}");
            ApiError::DatabaseError
        })?;

    let mut games_with_injuries: Vec<(SavedGame, Vec<InjuryStore>)> = Vec::new();
    for game in games {
        let injs = get_injuries_by_game_id(&game.game_id, con)?;
        games_with_injuries.push((game, injs));
    }

    let history_models = games_with_injuries
        .into_iter()
        .map(|(game, injuries)| HistoryModel { game, injuries })
        .collect::<Vec<HistoryModel>>();
    Ok(history_models)
}

pub fn get_data_dates(con: &mut PgConnection) -> Result<Vec<DateModel>, ApiError> {
    let model_names: Vec<String> = match saved_games::table
        .select(model_name)
        .distinct()
        .load::<String>(con)
    {
        Ok(names) => Ok(names),
        Err(e) => {
            error!("Error getting model names: {e}");
            Err(ApiError::DatabaseError)
        }
    }?;

    let mut model_and_dates = vec![];
    for model in model_names {
        let dates: Vec<String> = match saved_games::table
            .select(saved_games::date)
            .filter(model_name.eq(&model))
            .distinct()
            .load::<String>(con)
        {
            Ok(dates) => Ok(dates),
            Err(e) => {
                error!("Error getting saved games dates: {e}");
                Err(ApiError::DatabaseError)
            }
        }?;
        model_and_dates.push(DateModel {
            model_name: model,
            dates,
        });
    }

    Ok(model_and_dates)
}

#[derive(Serialize, Deserialize)]
pub struct DateModel {
    pub dates: Vec<String>,
    pub model_name: String,
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

fn get_injuries_by_game_id(
    game_id: &String,
    conn: &mut PgConnection,
) -> Result<Vec<InjuryStore>, ApiError> {
    match injuries::table
        .filter(injuries::game_id.eq(game_id))
        .load::<InjuryStore>(conn)
    {
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