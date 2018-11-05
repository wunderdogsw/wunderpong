/* eslint-disable no-unused-vars */

const CREATE_TRIGGER_PLAYER_RATING = `
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
    `

const DROP_TRIGGER_PLAYER_RATING = `
    DROP TRIGGER IF EXISTS update_player_rating ON matches
`

exports.up = function (knex, Promise) {
    const createPlayersTable = () => knex.schema
        .hasTable('players').then((exists) => {
            if (!exists) {
                return knex.schema.createTable('players', (table) => {
                    table.string('name').notNullable().primary()
                    table.integer('rating').notNullable().defaultTo(1500)
                })
            } else {
                return Promise.resolve()
            }
        })
    const createMatchesTable = () => knex.schema
        .hasTable('matches').then((exists) => {
            if (!exists) {
                return knex.schema.createTable('matches', (table) => {
                    // fields
                    table.increments('id').primary()
                    table.timestamp('created_at').defaultTo(knex.fn.now())
                    table.string('winner').notNullable()
                    table.string('loser').notNullable()
                    table.integer('winner_rating').notNullable()
                    table.integer('loser_rating').notNullable()

                    // constraints
                    table.foreign('winner', 'fk_winner').references('name').inTable('players').onUpdate('cascade').onDelete('restrict')
                    table.foreign('loser', 'fk_loser').references('name').inTable('players').onUpdate('cascade').onDelete('restrict')
                }).raw(CREATE_TRIGGER_PLAYER_RATING)
            } else {
                return Promise.resolve()
            }
        })
    return createPlayersTable().then(createMatchesTable)
}

exports.down = function (knex, Promise) {
    return knex.schema
        .dropTableIfExists('matches')
        .dropTableIfExists('players')
        .raw(DROP_TRIGGER_PLAYER_RATING)
}
