/* eslint-disable no-unused-vars */

const CREATE_TRIGGER_ROLLBACK_RATING = `

    CREATE OR REPLACE FUNCTION get_previous_rating(_param varchar(255)) RETURNS integer AS
    $BODY$
        DECLARE previous_rating integer;
        BEGIN
            WITH previous_match AS (
                (SELECT winner_rating AS rating, id FROM matches WHERE winner = _param)
                UNION ALL
                (SELECT loser_rating AS rating, id FROM matches WHERE loser = _param)
                ORDER BY id DESC
                LIMIT 1
            )
            SELECT rating into previous_rating FROM previous_match;
            RETURN COALESCE(previous_rating, 1500);
        END;
    $BODY$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION rollback_rating() RETURNS trigger AS 
    $BODY$
        BEGIN
            UPDATE players
            SET rating = ( SELECT get_previous_rating(OLD.winner) )
            WHERE name LIKE OLD.winner;

            UPDATE players
            SET rating = ( SELECT get_previous_rating(OLD.loser) )
            WHERE name LIKE OLD.loser;

            RETURN OLD;
        END;
    $BODY$
    LANGUAGE plpgsql;

    CREATE TRIGGER rollback_player_rating 
        AFTER DELETE ON matches
        FOR EACH ROW
        EXECUTE PROCEDURE rollback_rating();
    `

const DROP_TRIGGER_ROLLBACK_RATING = `
    DROP TRIGGER IF EXISTS rollback_player_rating ON matches
`

exports.up = function (knex, Promise) {
    return knex.schema.raw(CREATE_TRIGGER_ROLLBACK_RATING)
}

exports.down = function (knex, Promise) {
    return knex.schema.raw(DROP_TRIGGER_ROLLBACK_RATING)
}
