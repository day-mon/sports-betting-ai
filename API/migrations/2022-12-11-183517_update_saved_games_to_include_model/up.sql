-- Your SQL goes here
-- Your SQL goes here

-- add a new coloumn to the table named model and rename our_projected_winner to prediction

ALTER TABLE saved_games
    ADD COLUMN model_name TEXT NOT NULL default 'v1';

ALTER TABLE saved_games
    RENAME COLUMN our_projected_winner TO prediction;

ALTER TABLE saved_games
    ADD COLUMN confidence FLOAT;

-- drop the pkey and all that depends on it
ALTER TABLE saved_games
    DROP CONSTRAINT saved_games_pkey CASCADE;

-- add a new pkey to the table
ALTER TABLE saved_games
    ADD PRIMARY KEY (game_id, model_name);