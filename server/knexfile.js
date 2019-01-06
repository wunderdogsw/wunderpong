const dotenv = require('dotenv')
if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}
module.exports = {
    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL || 'postgresql://wunderpong:wunderpong@localhost:65432/wunderpong'
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
        connection: 'postgresql://wunderpong:wunderpong@localhost:65432/wunderpong_test'
    }
}
