import { knex } from '../db'

export const postMatch = async (winner, loser) => {
    if (winner.name === loser.name) {
        return Promise.reject('A player cannot play against himself / herself')
    }
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

export const getLatestMatchForPlayer = async (playerName) => {
    const match = await knex
        .select('*')
        .from('matches')
        .where({ winner: playerName })
        .orWhere({ loser: playerName })
        .orderBy('id', 'desc')
        .first()
    if (!match) {
        return Promise.reject(`Could not find match for ${playerName}`)
    }
    const playerWon = match.winner === playerName
    return {
        id: match.id,
        player: playerName,
        opponent: playerWon ? match.loser : match.winner,
        result: playerWon ? 'win' : 'loss'
    }
}

export const deleteMatch = async (playerName) => {
    const latestMatch = await getLatestMatchForPlayer(playerName)
    const opponentLatest = await getLatestMatchForPlayer(latestMatch.opponent)
    if (latestMatch.id !== opponentLatest.id) {
        return Promise.reject('Deleted match must be both players\' latest match')
    }
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