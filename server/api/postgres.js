import { Pool } from 'pg'
import format from 'pg-format'
import dotenv from 'dotenv'
import camelcaseKeys from 'camelcase-keys'

if (process.env.NODE_ENV !== 'production') {
  dotenv.load()
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

export const postMatch = async (winner, loser) => {
  const client = await pool.connect()
  const query = {
    name: 'add-match',
    text: `
      INSERT INTO "public"."matches"("winner", "loser")
      VALUES($1, $2)
      RETURNING "id", "created_at", "winner", "loser";
    `,
    values: [winner, loser],
  }
  const res = await client.query(query)
  await client.release()
  return res && res.rows && res.rows[0] && camelcaseKeys(res.rows[0])
}

export const getMatches = async () => {
  const client = await pool.connect()
  const res = await client.query(`
    SELECT *
    FROM matches
    ORDER BY created_at ASC
  `)
  await client.release()
  return res.rows
}
