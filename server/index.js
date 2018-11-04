require('babel-register')({})
require('babel-polyfill')
const db = require('./db/db').default
const runMigrationScripts = require('./db/run-migrations').runMigrationScripts
const app = require('./App').default
const PORT = process.env.PORT || 3000

db.init(process.env.DATABASE_URL)

runMigrationScripts().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening port -> ${PORT}`)
    })
})

