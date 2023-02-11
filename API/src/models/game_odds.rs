use std::string::ToString;

use phf::phf_map;
use serde_derive::Deserialize;
use serde_derive::Serialize;
use serde_json::Value;

use crate::models::game_with_odds::Odds;

// 15,30,255,280,68,246,264,74,1104,1906,76,75
static BOOKIES: phf::Map<&'static str, &'static str> = phf_map! {
    "255" => "Fanduel",
    "280" => "BetMGM",
    "68" => "DraftKings",
    "246" => "Unibet",
    "264" => "US",
    "74" => "BetPARX",
    "1906" => "Caesars",
    "76" => "Pointsbet",
};


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameOdds {
    pub league: League,
    pub games: Vec<Game>,
    #[serde(rename = "content_live_count")]
    pub content_live_count: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct League {
    pub id: i64,
    pub sport: String,
    pub name: String,
    pub description: String,
    pub logo: String,
    #[serde(rename = "current_season")]
    pub current_season: String,
    #[serde(rename = "current_season_type")]
    pub current_season_type: String,
    #[serde(rename = "pre_season_start")]
    pub pre_season_start: String,
    #[serde(rename = "pre_season_end")]
    pub pre_season_end: String,
    #[serde(rename = "reg_season_start")]
    pub reg_season_start: String,
    #[serde(rename = "reg_season_end")]
    pub reg_season_end: String,
    #[serde(rename = "post_season_start")]
    pub post_season_start: String,
    #[serde(rename = "post_season_end")]
    pub post_season_end: String,
    #[serde(rename = "blacklist_dates")]
    pub blacklist_dates: Vec<String>,
    #[serde(rename = "calendar_info")]
    pub calendar_info: CalendarInfo,
    #[serde(rename = "current_week")]
    pub current_week: i64,
    #[serde(rename = "updated_at")]
    pub updated_at: String,
    #[serde(rename = "is_active")]
    pub is_active: bool,
    pub conferences: Vec<Conference>,
    pub divisions: Vec<Division>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarInfo {
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Conference {
    pub id: String,
    pub display: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Division {
    pub id: String,
    pub display: String,
    #[serde(rename = "conference_id")]
    pub conference_id: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub id: i64,
    pub status: String,
    #[serde(rename = "real_status")]
    pub real_status: String,
    #[serde(rename = "status_display")]
    pub status_display: Option<Value>,
    #[serde(rename = "start_time")]
    pub start_time: String,
    #[serde(rename = "away_team_id")]
    pub away_team_id: i64,
    #[serde(rename = "home_team_id")]
    pub home_team_id: i64,
    #[serde(rename = "winning_team_id")]
    pub winning_team_id: Option<Value>,
    #[serde(rename = "league_name")]
    pub league_name: String,
    #[serde(rename = "type")]
    pub type_field: String,
    pub season: i64,
    pub attendance: i64,
    pub coverage: String,
    #[serde(rename = "is_free")]
    pub is_free: bool,
    pub trending: bool,
    #[serde(rename = "away_rotation_number")]
    pub away_rotation_number: i64,
    #[serde(rename = "home_rotation_number")]
    pub home_rotation_number: i64,
    pub teams: Vec<Team>,
    pub meta: Meta,
    pub odds: Vec<Odd>,
    pub broadcast: Broadcast,
}


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Team {
    pub id: i64,
    #[serde(rename = "full_name")]
    pub full_name: String,
    #[serde(rename = "display_name")]
    pub display_name: String,
    #[serde(rename = "short_name")]
    pub short_name: String,
    pub location: String,
    pub abbr: String,
    pub logo: String,
    #[serde(rename = "primary_color")]
    pub primary_color: String,
    #[serde(rename = "secondary_color")]
    pub secondary_color: String,
    #[serde(rename = "conference_type")]
    pub conference_type: String,
    #[serde(rename = "division_type")]
    pub division_type: String,
    #[serde(rename = "url_slug")]
    pub url_slug: String,
    pub standings: Standings,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Standings {
    pub win: i64,
    pub loss: i64,
    pub ties: Option<Value>,
    #[serde(rename = "overtime_losses")]
    pub overtime_losses: Option<Value>,
    pub draw: Option<Value>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Meta {
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Odd {
    #[serde(rename = "ml_away")]
    pub ml_away: i64,
    #[serde(rename = "ml_home")]
    pub ml_home: i64,
    #[serde(rename = "spread_away")]
    pub spread_away: f64,
    #[serde(rename = "spread_home")]
    pub spread_home: f64,
    #[serde(rename = "spread_away_line")]
    pub spread_away_line: i64,
    #[serde(rename = "spread_home_line")]
    pub spread_home_line: i64,
    pub over: i64,
    pub under: i64,
    pub draw: Option<Value>,
    pub total: f64,
    #[serde(rename = "away_total")]
    pub away_total: Option<f64>,
    #[serde(rename = "away_over")]
    pub away_over: Option<i64>,
    #[serde(rename = "away_under")]
    pub away_under: Option<i64>,
    #[serde(rename = "home_total")]
    pub home_total: Option<f64>,
    #[serde(rename = "home_over")]
    pub home_over: Option<i64>,
    #[serde(rename = "home_under")]
    pub home_under: Option<i64>,
    #[serde(rename = "ml_home_public")]
    pub ml_home_public: Option<i64>,
    #[serde(rename = "ml_away_public")]
    pub ml_away_public: Option<i64>,
    #[serde(rename = "spread_home_public")]
    pub spread_home_public: Option<i64>,
    #[serde(rename = "spread_away_public")]
    pub spread_away_public: Option<i64>,
    #[serde(rename = "total_under_public")]
    pub total_under_public: Option<i64>,
    #[serde(rename = "total_over_public")]
    pub total_over_public: Option<i64>,
    #[serde(rename = "ml_home_money")]
    pub ml_home_money: Option<i64>,
    #[serde(rename = "ml_away_money")]
    pub ml_away_money: Option<i64>,
    #[serde(rename = "spread_home_money")]
    pub spread_home_money: Option<i64>,
    #[serde(rename = "spread_away_money")]
    pub spread_away_money: Option<i64>,
    #[serde(rename = "total_over_money")]
    pub total_over_money: Option<i64>,
    #[serde(rename = "total_under_money")]
    pub total_under_money: Option<i64>,
    pub meta: Option<Meta2>,
    #[serde(rename = "num_bets")]
    pub num_bets: Option<i64>,
    #[serde(rename = "book_id")]
    pub book_id: i64,
    #[serde(rename = "type")]
    pub type_field: String,
    pub inserted: String,
    #[serde(rename = "line_status")]
    pub line_status: LineStatus,
}

impl Odd {
    pub fn into_odds(self) -> Odds {
        let book_id = self.book_id.to_string();
        let book_name = BOOKIES.get(&book_id)
            .map(|&book| book.to_string())
            .unwrap_or("Unknown".to_string());

        Odds {
            book_name,
            home_team_odds: self.ml_home as i32,
            away_team_odds: self.ml_away as i32,
            predicted_score: self.total
        }
    }
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Meta2 {
    pub draw: Option<Value>,
    pub over: Option<Over>,
    pub under: Option<Under>,
    #[serde(rename = "ml_away")]
    pub ml_away: Option<MlAway>,
    #[serde(rename = "ml_home")]
    pub ml_home: Option<MlHome>,
    #[serde(rename = "away_over")]
    pub away_over: Option<AwayOver>,
    #[serde(rename = "home_over")]
    pub home_over: Option<HomeOver>,
    #[serde(rename = "away_under")]
    pub away_under: Option<AwayUnder>,
    #[serde(rename = "home_under")]
    pub home_under: Option<HomeUnder>,
    #[serde(rename = "spread_away")]
    pub spread_away: Option<SpreadAway>,
    #[serde(rename = "spread_home")]
    pub spread_home: Option<SpreadHome>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Over {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<Option<Value>>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<Value>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "event_id")]
    pub event_id: Option<Value>,
    #[serde(rename = "line_id")]
    pub line_id: Option<Value>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id2: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Under {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<Value>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<Value>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "event_id")]
    pub event_id: Option<Value>,
    #[serde(rename = "line_id")]
    pub line_id: Option<Value>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id2: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MlAway {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<Value>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<Value>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "event_id")]
    pub event_id: Option<Value>,
    #[serde(rename = "line_id")]
    pub line_id: Option<Value>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id2: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MlHome {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<Value>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<Value>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "event_id")]
    pub event_id: Option<Value>,
    #[serde(rename = "line_id")]
    pub line_id: Option<Value>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id2: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayOver {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<String>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<i64>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeOver {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<String>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<i64>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayUnder {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<String>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<i64>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeUnder {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<String>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<i64>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpreadAway {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<Value>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<Value>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "event_id")]
    pub event_id: Option<Value>,
    #[serde(rename = "line_id")]
    pub line_id: Option<Value>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id2: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpreadHome {
    #[serde(rename = "outcome_id")]
    pub outcome_id: i64,
    #[serde(rename = "selection_id")]
    pub selection_id: Option<Value>,
    #[serde(rename = "game_id")]
    pub game_id: Option<i64>,
    #[serde(rename = "market_id")]
    pub market_id: Option<Value>,
    #[serde(rename = "result_id")]
    pub result_id: Option<i64>,
    #[serde(rename = "event_id")]
    pub event_id: Option<Value>,
    #[serde(rename = "line_id")]
    pub line_id: Option<Value>,
    #[serde(rename = "Sport")]
    pub sport: Option<String>,
    #[serde(rename = "EventId")]
    pub event_id2: Option<String>,
    #[serde(rename = "LeagueName")]
    pub league_name: Option<String>,
    #[serde(rename = "GlobalMarketId")]
    pub global_market_id: Option<String>,
    #[serde(rename = "ExternalEventId")]
    pub external_event_id: Option<String>,
    #[serde(rename = "GlobalSelectionId")]
    pub global_selection_id: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LineStatus {
    pub draw: Option<i64>,
    pub over: i64,
    pub under: i64,
    #[serde(rename = "ml_away")]
    pub ml_away: i64,
    #[serde(rename = "ml_home")]
    pub ml_home: i64,
    #[serde(rename = "away_over")]
    pub away_over: Option<i64>,
    #[serde(rename = "home_over")]
    pub home_over: Option<i64>,
    #[serde(rename = "away_under")]
    pub away_under: Option<i64>,
    #[serde(rename = "home_under")]
    pub home_under: Option<i64>,
    #[serde(rename = "spread_away")]
    pub spread_away: i64,
    #[serde(rename = "spread_home")]
    pub spread_home: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Broadcast {
    pub network: String,
    pub internet: Option<Value>,
    pub satellite: String,
}

