use serde_derive::Deserialize;
use serde_derive::Serialize;
use crate::models::game_with_odds::Odds;

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
    pub odds_type_id: Option<i64>,
    #[serde(rename = "group_name")]
    pub group_name: String,
    pub books: Vec<Book>,
}

impl Market {
    pub fn has_2way(&self) -> bool {
        self.name == "2way"
    }

    pub fn has_american_books(&self) -> bool {
        self.books.iter().any(|bk| bk.country_code == "US")
    }
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Book {
    pub id: String,
    pub name: String,
    pub outcomes: Option<Vec<Outcome>>,
    pub url: String,
    pub country_code: String,
}

impl Book {
    pub fn to_odds(&self) -> Odds     {
        let outcomes = self.outcomes.clone().unwrap();

        let home_team_index = outcomes.iter().position(|o| o.type_field == "home").unwrap();
        let away_team_index = outcomes.iter().position(|o| o.type_field == "away").unwrap();

        Odds {
            book_name: self.name.clone(),
            home_team_odds: outcomes[home_team_index].odds.parse::<f64>().unwrap_or(-1.0),
            home_team_opening_odds: outcomes[home_team_index].opening_odds.parse::<f64>().unwrap_or(-1.0),
            away_team_odds: outcomes[away_team_index].odds.parse::<f64>().unwrap(),
            away_team_opening_odds: outcomes[away_team_index].opening_odds.parse::<f64>().unwrap_or(-1.0),
            home_team_odds_trend:  outcomes[home_team_index].odds_trend.to_string(),
            away_team_odds_trend: outcomes[away_team_index].odds_trend.to_string(),
        }
    }
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
