-- Your SQL goes here
-- pub struct SavedGame {
--     pub game_id: String,
--     pub home_team_name: String,
--     pub home_team_score: String,
--     pub away_team_name: String,
--     pub away_team_score: String,
--     pub winner: String,
--     pub our_projected_winner: String
-- }

CREATE TABLE IF NOT EXISTS saved_games (
    game_id TEXT PRIMARY KEY,
    home_team_name TEXT NOT NULL,
    home_team_score TEXT NOT NULL ,
    away_team_name TEXT NOT NULL ,
    away_team_score TEXT NOT NULL ,
    winner TEXT NOT NULL ,
    our_projected_winner TEXT,
    date TEXT NOT NULL
);