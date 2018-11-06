import { knex } from '../db'
const TWO_MONTHS = 60 * 24 * 60 * 60 * 1000

export const postMatch = async (winner, loser) => {
    return knex('matches')
        .insert({ winner: winner, loser: loser })
}

export const getMatches = async () => {
    return knex
        .select('*')
        .from('matches')
        .where('created_at', '>=', new Date(Date.now() - TWO_MONTHS))
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