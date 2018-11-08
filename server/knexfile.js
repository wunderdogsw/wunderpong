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
        connection: {  
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        }
    },
    test: {
        client: 'pg',
        connection: 'postgresql://wunderpong:wunderpong@localhost:5432/wunderpong_test'
    }
}