/* eslint-disable no-unused-vars */

exports.up = function (knex, Promise) {
    return knex.schema.raw(`
        alter table matches drop constraint fk_winner;
        alter table matches drop constraint fk_loser;
        drop trigger update_player_rating on matches;
        drop function set_rating;
        drop trigger rollback_player_rating on matches;
        alter function get_previous_rating rename to get_rating;
        drop table players;
        create or replace view players (name, rating) as 
            select distinct tmp.name, (get_rating(tmp.name)) as rating 
            from (
                (select winner as name from matches) 
                union all 
                (select loser as name from matches)
            ) as tmp 
            order by rating desc, name asc;
  `)
}

exports.down = function (knex, Promise) {
    throw new Error('This migration only goes UP')
}
