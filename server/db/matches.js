import { knex } from '../db'
import * as config from '../config'

export const postMatch = async (winner, loser) => {
    return knex('matches')
        .insert({ winner: winner, loser: loser })
}

export const getMatches = async (from, to) => {
    const start = from || new Date(Date.now() - config.ratingDecayTimeMilliseconds)
    const end = to || knex.fn.now()
    return knex
        .select('*')
        .from('matches')
        .whereBetween('created_at', [start, end])
        .orderBy('created_at', 'asc')
}

export const deleteMatch = async (playerName) => {
    return knex('matches')
        .del()
        .whereIn('id', (cmd) => {
            cmd.select('id')
                .from('matches')
                .where({ winner: playerName })
                .orWhere({ loser: playerName })
                .orderBy('id', 'desc')
                .limit(1)
        })
}
