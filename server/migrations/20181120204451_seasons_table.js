/* eslint-disable no-unused-vars */

exports.up = function (knex, Promise) {
    return knex.schema.createTable('seasons', (table) => {
            table.increments('id'),
            table.timestamp('start').notNullable(),
            table.timestamp('end').notNullable(),
            table.integer('decay_interval').notNullable().defaultTo(1),
            table.enu('decay_period', ['week'], { useNative: true, enumName: 'period' }).notNullable().defaultTo('week')
        table.integer('decay_percentage').notNullable().defaultTo(0)
    }).then(() => {
        return knex('seasons').insert([{
            start: '2019-01-07 08:00:00+02',
            end: '2019-06-01 00:00:00+02',
            decay_percentage: 1
        }])
    })
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('seasons')
}
