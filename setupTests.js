import { knex, runMigrations } from './server/db'

beforeAll(async () => {
    await runMigrations()
})

afterAll(async () => {
    await knex.destroy()
})