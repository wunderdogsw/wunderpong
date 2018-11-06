import { knex } from '../db'

export const getPlayer = async (name) => {
    const existing = await knex
        .select('*')
        .from('players')
        .where({ name })
        .first()
    return existing || (await knex.insert({ name }, ['name', 'rating']).into('players')).pop()
}

export const getLadder = async () => {
    return knex
        .select('name', 'rating')
        .from('players')
        .orderBy('rating', 'desc')
        .orderBy('name', 'asc')
}