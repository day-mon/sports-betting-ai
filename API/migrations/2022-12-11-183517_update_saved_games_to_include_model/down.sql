
ALTER TABLE saved_games
    DROP COLUMN model_name;

ALTER TABLE saved_games
    RENAME COLUMN prediction TO our_projected_winner;

ALTER TABLE saved_games
    DROP COLUMN confidence;


