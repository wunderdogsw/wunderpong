import { Pool } from 'pg'
import { getMatches, getPlayer, runMigrationScript, getMigrations } from '../api'
import Elo from 'arpad'

const elo = new Elo()
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
})

const migrations = {
    '20181018_add_score_columns': async () => {
        await runMigrationScript('20181018_add_score_columns.sql');
        const matches = await getMatches()
        for (const match of matches) {
            const winner = await getPlayer(match.winner)
            const loser = await getPlayer(match.loser)
            const new_winner_rating = elo.newRatingIfWon(winner.rating, loser.rating)
            const new_loser_rating = elo.newRatingIfLost(loser.rating, winner.rating)

            console.log(`updating match ${match.id}: ${match.winner} -> ${new_winner_rating}; ${match.loser} -> ${new_loser_rating}`)
            const client = await pool.connect()
            const query = {
                name: 'update-rating',
                text: `
                UPDATE "matches"
                SET "winner_rating"=$2, "loser_rating"=$3
                WHERE "id"=$1
              `,
                values: [match.id, new_winner_rating, new_loser_rating],
            }
            await client.query(query)
            await client.release()
        }
    }
}

export async function runMigrationScripts() {
    const completedMigrations = await getMigrations()
    for (const key of Object.keys(migrations)) {
        if (!completedMigrations.find(({ name }) => name === key)) {
            await migrations[key]()
        }
    }
}
