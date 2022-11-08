use{
    serde::{Deserialize, Serialize},
};


#[derive(Deserialize, Serialize)]
pub struct Game {
    pub(crate) team_one: String,
    pub(crate) team_two: String,
    pub(crate) over_under: f32,
    pub(crate) team_one_odds: f32,
    pub(crate) team_two_odds: f32
}
