use serde_derive::Deserialize;
use serde_derive::Serialize;
use serde_json::Value;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TeamStats {
    pub resource: String,
    pub parameters: Parameters,
    pub result_sets: Vec<ResultSet>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Parameters {
    #[serde(rename = "MeasureType")]
    pub measure_type: String,
    #[serde(rename = "PerMode")]
    pub per_mode: String,
    #[serde(rename = "PlusMinus")]
    pub plus_minus: String,
    #[serde(rename = "PaceAdjust")]
    pub pace_adjust: String,
    #[serde(rename = "Rank")]
    pub rank: String,
    #[serde(rename = "LeagueID")]
    pub league_id: String,
    #[serde(rename = "Season")]
    pub season: String,
    #[serde(rename = "SeasonType")]
    pub season_type: String,
    #[serde(rename = "PORound")]
    pub poround: i64,
    #[serde(rename = "Outcome")]
    pub outcome: Value,
    #[serde(rename = "Location")]
    pub location: Value,
    #[serde(rename = "Month")]
    pub month: i64,
    #[serde(rename = "SeasonSegment")]
    pub season_segment: Value,
    #[serde(rename = "DateFrom")]
    pub date_from: Value,
    #[serde(rename = "DateTo")]
    pub date_to: Value,
    #[serde(rename = "OpponentTeamID")]
    pub opponent_team_id: i64,
    #[serde(rename = "VsConference")]
    pub vs_conference: Value,
    #[serde(rename = "VsDivision")]
    pub vs_division: Value,
    #[serde(rename = "TeamID")]
    pub team_id: i64,
    #[serde(rename = "Conference")]
    pub conference: Value,
    #[serde(rename = "Division")]
    pub division: Value,
    #[serde(rename = "GameSegment")]
    pub game_segment: Value,
    #[serde(rename = "Period")]
    pub period: i64,
    #[serde(rename = "ShotClockRange")]
    pub shot_clock_range: Value,
    #[serde(rename = "LastNGames")]
    pub last_ngames: i64,
    #[serde(rename = "GameScope")]
    pub game_scope: Value,
    #[serde(rename = "PlayerExperience")]
    pub player_experience: Value,
    #[serde(rename = "PlayerPosition")]
    pub player_position: Value,
    #[serde(rename = "StarterBench")]
    pub starter_bench: Value,
    #[serde(rename = "TwoWay")]
    pub two_way: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultSet {
    pub name: String,
    pub headers: Vec<String>,
    pub row_set: Vec<Vec<Value>>,
}
