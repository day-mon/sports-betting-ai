-- Your SQL goes here

CREATE TABLE IF NOT EXISTS injuries (
    player TEXT NOT NULL,
    team TEXT NOT NULL,
    position TEXT NOT NULL ,
    status TEXT NOT NULL,
    injury TEXT NOT NULL,
    game_id TEXT NOT NULL,
    PRIMARY KEY (player, game_id),
    FOREIGN KEY(game_id) REFERENCES saved_games(game_id)
)