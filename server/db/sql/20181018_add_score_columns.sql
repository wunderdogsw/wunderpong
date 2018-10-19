DO $$ 
    BEGIN
        CREATE TABLE players (
            name VARCHAR NOT NULL UNIQUE PRIMARY KEY, 
            rating INT NOT NULL DEFAULT 1500
        );

        INSERT INTO players (name) (
            SELECT DISTINCT *
            FROM (
                SELECT winner from matches 
                UNION ALL 
                SELECT loser from matches
            ) as tbl 
        );

        ALTER TABLE matches 
        ADD COLUMN winner_rating INT NOT NULL DEFAULT 0,
        ADD COLUMN loser_rating INT DEFAULT 0;

        ALTER TABLE matches 
        ADD CONSTRAINT fk_winner FOREIGN KEY (winner) REFERENCES players (name) ON UPDATE CASCADE ON DELETE RESTRICT,
        ADD CONSTRAINT fk_loser FOREIGN KEY(loser) REFERENCES players(name) ON UPDATE CASCADE ON DELETE RESTRICT;

        CREATE FUNCTION set_rating() RETURNS trigger AS 
        $BODY$
            BEGIN
                UPDATE players SET rating = NEW.winner_rating WHERE name LIKE NEW.winner;
                UPDATE players SET rating = NEW.loser_rating WHERE name LIKE NEW.loser;
                RETURN NEW;
            END;
        $BODY$
        LANGUAGE plpgsql;        

        CREATE TRIGGER update_player_rating 
            AFTER INSERT OR UPDATE ON matches
            FOR EACH ROW
            EXECUTE PROCEDURE set_rating();

        INSERT INTO migrations (name) VALUES ('20181018_add_score_columns');
    END;
$$