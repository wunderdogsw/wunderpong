import { knex } from '../db'

export const postMatch = async (winner, loser) => {
    return knex
        .insert({ winner: winner.name, winner_rating: winner.rating, loser: loser.name, loser_rating: loser.rating })
        .into('matches')
}

export const getMatches = async () => {
    return knex
        .select('*')
        .from('matches')
        .orderBy('created_at', 'asc')
}

export const deleteMatch = async (playerName) => {
    /**
     * TODO: validoi että kummankin pelaajan viimeisin matsi on sama peli, muuten kusee
     */
    
    return knex('matches')
        .del()
        .where((cmd) => {
            cmd.where({ winner: playerName }).orWhere({ loser: playerName })
        })
        .andWhere('created_at', '>=', new Date(Date.now() - 5 * 60 * 1000)) // within 5 minutes
        .orderBy('created_at', 'desc')
        .limit(1)
}