import { knex } from '../db'

export const getOngoingSeason = async () => {
    const now = new Date()
    const rows = await knex('seasons')
        .where('start', '<', now)
        .andWhere('end', '>', now)
        .limit(1)
    return rows.pop()
}