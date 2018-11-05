import Knex from 'knex'
import path from 'path'
const knexfile = require('../knexfile.js')
const env = process.env.NODE_ENV || 'development'
const directory = path.join(__dirname, '../migrations')

export const knex = Knex(knexfile[env])
export const runMigrations = () => knex.migrate.latest({ directory })
export const rollback = () => knex.migrate.rollback({ directory })
