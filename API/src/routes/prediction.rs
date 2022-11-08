use{

    serde::{Deserialize, Serialize},
};


#[derive(Deserialize, Serialize)]
    pub struct Prediction {
        pub over_under: String,
        pub team_won: String,
        pub team_loose: String,
        pub team_won_chance: f32,
        pub team_loose_chance: f32,
        pub over_under_chance: f32,
        pub expected_value: f32,
    }
