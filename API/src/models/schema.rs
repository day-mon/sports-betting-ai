// @generated automatically by Diesel CLI.

diesel::table! {
    saved_games (game_id) {
        game_id -> Text,
        home_team_name -> Text,
        home_team_score -> Text,
        away_team_name -> Text,
        away_team_score -> Text,
        winner -> Text,
        our_projected_winner -> Nullable<Text>,
        date -> Text,
    }
}
