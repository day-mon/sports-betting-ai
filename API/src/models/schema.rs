// @generated automatically by Diesel CLI.

diesel::table! {
    injuries (player, game_id) {
        player -> Text,
        team -> Text,
        position -> Text,
        status -> Text,
        injury -> Text,
        game_id -> Text,
    }
}

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

diesel::joinable!(injuries -> saved_games (game_id));

diesel::allow_tables_to_appear_in_same_query!(
    injuries,
    saved_games,
);
