-- Your SQL goes here
-- pub struct Game {
--     pub game_id: String,
--     pub start_time: String,
--     pub home_team_name: String,
--     pub home_team_score: String,
--     pub away_team_name: String,
--     pub away_team_score: String,
--     pub home_team_id: i64,
--     pub away_team_id: i64,
-- }

CREATE TABLE game (
    game_id TEXT PRIMARY KEY,
    start_time TEXT,
    home_team_name TEXT,
    home_team_score TEXT,
    away_team_name TEXT,
    away_team_score TEXT,
    home_team_id INTEGER,
    away_team_id INTEGER
);