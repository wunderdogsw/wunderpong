import { Pool } from 'pg'

class DB {

    pool = null

    init = (connectionString, ssl) => {
        if (this.pool !== null) {
            console.warn('Database already initialized')
            return
        }
        this.pool = new Pool({ connectionString, ssl })
    }

    query = async (query) => {
        if (this.pool === null) {
            throw new Error('Database not initialized')
        }
        const conn = await this.pool.connect()
        return conn.query(query)
            .then(res => {
                conn.release()
                return res.rows
            })
            .catch(err => {
                console.log('err', err)
                return null
            })
    }

    close = async () => {
        if (this.pool === null) {
            throw new Error('Database not initialized')
        }
        await this.pool.end()
        this.pool = null
    }
}

export default new DB()
