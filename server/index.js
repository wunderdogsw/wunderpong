require('babel-register')({})
require('babel-polyfill')
const db = require('./db')
const app = require('./App').default
const PORT = process.env.PORT || 3000

db.runMigrations().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening port -> ${PORT}`)
    })
})

