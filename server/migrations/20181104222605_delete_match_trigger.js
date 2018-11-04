/* eslint-disable no-unused-vars */

const CREATE_TRIGGER_ROLLBACK_RATING = `
    CREATE FUNCTION rollback_rating() RETURNS trigger AS 
    $BODY$
        BEGIN
            UPDATE players
            SET rating=tmp.rating
            FROM (
                (SELECT winner_rating AS rating, created_at FROM matches WHERE winner LIKE OLD.winner)
                UNION ALL
                (SELECT loser_rating AS rating, created_at FROM matches WHERE loser LIKE OLD.winner)
                ORDER BY created_at DESC
                LIMIT 1
            ) as tmp
            WHERE name LIKE OLD.winner;

            UPDATE players
            SET rating=tmp2.rating
            FROM (
                (SELECT winner_rating AS rating, created_at FROM matches WHERE winner LIKE OLD.loser)
                UNION ALL
                (SELECT loser_rating AS rating, created_at FROM matches WHERE loser LIKE OLD.loser)
                ORDER BY created_at DESC
                LIMIT 1
            ) as tmp2
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
