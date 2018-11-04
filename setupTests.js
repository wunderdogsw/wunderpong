import db from './server/db/db'
import fs from 'fs'
import path from 'path'
import { runMigrationScripts } from './server/db/run-migrations'

beforeAll(async () => {
    db.init('postgresql://wunderpong:wunderpong@localhost:5432/wunderpong_test')
    await db.query('DROP SCHEMA public CASCADE')
    await db.query('CREATE SCHEMA public')
    await db.query(fs.readFileSync(path.join(__dirname, './db.ddl'), 'utf8'))
    await runMigrationScripts()
})

afterAll(async () => {
    await db.close()
})