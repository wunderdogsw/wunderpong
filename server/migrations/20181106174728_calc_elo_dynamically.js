/* eslint-disable no-unused-vars */

exports.up = function(knex, Promise) {
  return knex.raw(`
    drop view if exists players;
    drop function if exists get_rating;
    alter table matches drop column if exists winner_rating;
    alter table matches drop column if exists loser_rating;
  `)
}

exports.down = function(knex, Promise) {
    throw new Error('This migration only goes UP')
}
