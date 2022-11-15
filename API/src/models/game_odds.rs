use serde_derive::Deserialize;
use serde_derive::Serialize;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameOdds {
    pub games: Vec<Game>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub game_id: String,
    #[serde(rename = "sr_id")]
    pub sr_id: String,
    pub sr_match_id: String,
    pub home_team_id: String,
    pub away_team_id: String,
    pub markets: Vec<Market>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Market {
    pub name: String,
    #[serde(rename = "odds_type_id")]
    pub odds_type_id: i64,
    #[serde(rename = "group_name")]
    pub group_name: String,
    pub books: Vec<Book>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Book {
    pub id: String,
    pub name: String,
    pub outcomes: Vec<Outcome>,
    pub url: String,
    pub country_code: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Outcome {
    #[serde(rename = "odds_field_id")]
    pub odds_field_id: i64,
    #[serde(rename = "type")]
    pub type_field: String,
    pub odds: String,
    #[serde(rename = "opening_odds")]
    pub opening_odds: String,
    #[serde(rename = "odds_trend")]
    pub odds_trend: String,
    pub spread: Option<String>,
    #[serde(rename = "opening_spread")]
    pub opening_spread: Option<f64>,
}
