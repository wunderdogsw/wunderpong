import { knex } from '../db'

export const postMatch = async (winner, loser) => {
    return knex('matches')
        .insert({ winner: winner, loser: loser })
}

export const getMatches = async () => {
    return knex
        .select('*')
        .from('matches')
        // FIXME: uncomment to enable decay (matches after 30 days do not count towards rating)
        // .where('created_at', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
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