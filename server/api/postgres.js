import { Pool } from 'pg'
import dotenv from 'dotenv'
import camelcaseKeys from 'camelcase-keys'
import path from 'path'
import fs from 'fs'

if (process.env.NODE_ENV !== 'production') {
  dotenv.load()
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production',
})

// get player from db or create new if it does not exist
export const getPlayer = async (name) => {
  const client = await pool.connect()
  const res = await client.query({
    name: 'get-player',
    text: `
      WITH newplayers AS (
        INSERT INTO players ("name") VALUES ($1)
        ON CONFLICT DO NOTHING 
        RETURNING *
      ) 
      SELECT * FROM newplayers
      UNION ALL
      SELECT * FROM players WHERE "name" LIKE $1`,
    values: [name]
  })
  await client.release()
  return res && res.rows && res.rows[0]
}

export const postMatch = async (winner, loser) => {
  const client = await pool.connect()
  const query = {
    name: 'add-match',
    text: `
      INSERT INTO "public"."matches"("winner", "loser", "winner_rating", "loser_rating")
      VALUES($1, $2, $3, $4)
      RETURNING "id", "created_at", "winner", "loser";
    `,
    values: [winner.name, loser.name, winner.rating, loser.rating],
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

export const getMigrations = async () => {
  const client = await pool.connect()
  const res = await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      name VARCHAR NOT NULL UNIQUE PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    SELECT * FROM migrations ORDER BY created_at ASC
  `)
  await client.release()
  return res[1].rows
}

export const getLadder = async () => {
  const client = await pool.connect()
  const res = await client.query(`
    SELECT "name", "rating"
    FROM players
    ORDER BY "rating" DESC
  `)
  await client.release()
  return res.rows
}

export const runMigrationScript = async (fileName) => {
  const sql = fs.readFileSync(path.join(__dirname, '../db/sql', fileName), 'utf8')
  const client = await pool.connect()
  await client.query(sql)
  await client.release()
}
