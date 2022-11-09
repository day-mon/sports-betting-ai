use serde_derive::Deserialize;
use serde_derive::Serialize;
use serde_json::Value;



#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SeasonGames {
    pub meta: Meta,
    pub league_schedule: LeagueSchedule,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Meta {
    pub version: i64,
    pub request: String,
    pub time: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LeagueSchedule {
    pub season_year: String,
    pub league_id: String,
    pub game_dates: Vec<GameDate>,
    pub weeks: Vec<Week>,
    pub broadcaster_list: Vec<BroadcasterList>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameDate {
    pub game_date: String,
    pub games: Vec<Game>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub game_id: String,
    pub game_code: String,
    pub game_status: i64,
    pub game_status_text: String,
    pub game_sequence: i64,
    pub game_date_est: String,
    pub game_time_est: String,
    pub game_date_time_est: String,
    #[serde(rename = "gameDateUTC")]
    pub game_date_utc: String,
    #[serde(rename = "gameTimeUTC")]
    pub game_time_utc: String,
    #[serde(rename = "gameDateTimeUTC")]
    pub game_date_time_utc: String,
    pub away_team_time: String,
    pub home_team_time: String,
    pub day: String,
    pub month_num: i64,
    pub week_number: i64,
    pub week_name: String,
    pub if_necessary: bool,
    pub series_game_number: String,
    pub series_text: String,
    pub arena_name: String,
    pub arena_state: String,
    pub arena_city: String,
    pub postponed_status: String,
    pub branch_link: String,
    pub broadcasters: Broadcasters,
    pub home_team: HomeTeam,
    pub away_team: AwayTeam,
    pub points_leaders: Vec<PointsLeader>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Broadcasters {
    pub national_tv_broadcasters: Vec<NationalTvBroadcaster>,
    pub national_radio_broadcasters: Vec<NationalRadioBroadcaster>,
    pub home_tv_broadcasters: Vec<HomeTvBroadcaster>,
    pub home_radio_broadcasters: Vec<HomeRadioBroadcaster>,
    pub away_tv_broadcasters: Vec<AwayTvBroadcaster>,
    pub away_radio_broadcasters: Vec<AwayRadioBroadcaster>,
    pub intl_radio_broadcasters: Vec<Value>,
    pub intl_tv_broadcasters: Vec<Value>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NationalTvBroadcaster {
    pub broadcaster_scope: String,
    pub broadcaster_media: String,
    pub broadcaster_id: i64,
    pub broadcaster_display: String,
    pub broadcaster_abbreviation: String,
    pub tape_delay_comments: String,
    pub region_id: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NationalRadioBroadcaster {
    pub broadcaster_scope: String,
    pub broadcaster_media: String,
    pub broadcaster_id: i64,
    pub broadcaster_display: String,
    pub broadcaster_abbreviation: String,
    pub tape_delay_comments: String,
    pub region_id: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeTvBroadcaster {
    pub broadcaster_scope: String,
    pub broadcaster_media: String,
    pub broadcaster_id: i64,
    pub broadcaster_display: String,
    pub broadcaster_abbreviation: String,
    pub tape_delay_comments: String,
    pub region_id: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeRadioBroadcaster {
    pub broadcaster_scope: String,
    pub broadcaster_media: String,
    pub broadcaster_id: i64,
    pub broadcaster_display: String,
    pub broadcaster_abbreviation: String,
    pub tape_delay_comments: String,
    pub region_id: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayTvBroadcaster {
    pub broadcaster_scope: String,
    pub broadcaster_media: String,
    pub broadcaster_id: i64,
    pub broadcaster_display: String,
    pub broadcaster_abbreviation: String,
    pub tape_delay_comments: String,
    pub region_id: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayRadioBroadcaster {
    pub broadcaster_scope: String,
    pub broadcaster_media: String,
    pub broadcaster_id: i64,
    pub broadcaster_display: String,
    pub broadcaster_abbreviation: String,
    pub tape_delay_comments: String,
    pub region_id: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeTeam {
    pub team_id: i64,
    pub team_name: String,
    pub team_city: String,
    pub team_tricode: String,
    pub team_slug: String,
    pub wins: i64,
    pub losses: i64,
    pub score: i64,
    pub seed: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayTeam {
    pub team_id: i64,
    pub team_name: String,
    pub team_city: String,
    pub team_tricode: String,
    pub team_slug: String,
    pub wins: i64,
    pub losses: i64,
    pub score: i64,
    pub seed: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PointsLeader {
    pub person_id: i64,
    pub first_name: String,
    pub last_name: String,
    pub team_id: i64,
    pub team_city: String,
    pub team_name: String,
    pub team_tricode: String,
    pub points: f64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Week {
    pub week_number: i64,
    pub week_name: String,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BroadcasterList {
    pub broadcaster_id: i64,
    pub broadcaster_display: String,
    pub broadcaster_abbreviation: String,
    pub region_id: i64,
}
