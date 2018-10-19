require('babel-register')({})
require('babel-polyfill')
const runMigrationScripts = require('./db/run-migrations').runMigrationScripts
const app = require('./App').default
const PORT = process.env.PORT || 3000

runMigrationScripts().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening port -> ${PORT}`)
    })
})

