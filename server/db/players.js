import { knex } from '../db'

export const getPlayer = async (name) => {
    const existing = await knex
        .select('*')
        .from('players')
        .where({ name })
        .first()
    return existing || { name, rating: 1500 }
}

export const getLadder = async () => {
    return knex
        .select('name', 'rating')
        .from('players')
        .orderBy('rating', 'desc')
        .orderBy('name', 'asc')
}