const dotenv = require('dotenv')
if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}
module.exports = {
    development: {
        client: 'pg',
        connection: 'postgresql://wunderpong:wunderpong@localhost:5432/d89mdaft5ocbms'
    },
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL
    },
    test: {
        client: 'pg',
        connection: 'postgresql://wunderpong:wunderpong@localhost:5432/wunderpong_test'
    }
}