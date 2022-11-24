// @generated automatically by Diesel CLI.

diesel::table! {
    game (game_id) {
        game_id -> Text,
        start_time -> Nullable<Text>,
        home_team_name -> Nullable<Text>,
        home_team_score -> Nullable<Text>,
        away_team_name -> Nullable<Text>,
        away_team_score -> Nullable<Text>,
        home_team_id -> Nullable<Int4>,
        away_team_id -> Nullable<Int4>,
    }
}
