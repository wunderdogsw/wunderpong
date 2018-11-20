import { knex } from '../'
import { getOngoingSeason } from '../seasons'

const ONE_DAY = 24 * 60 * 60 * 1000

jest.mock('node-cron', () => ({ schedule: jest.fn() }))

describe('seasons db functions', () => {

    const now = new Date().getTime()

    afterEach(async () => {
        await knex('seasons').del().whereNotNull('id')
    })

    it('getOngoingSeason should return ongoing season when season is active', async () => {
        await knex('seasons').insert({ start: new Date(now - ONE_DAY), end: new Date(now + ONE_DAY) })
        const season = await getOngoingSeason()
        expect(season).toBeDefined()
        expect(Object.keys(season)).toEqual(['id', 'start', 'end', 'decay_interval', 'decay_period', 'decay_percentage'])
    })

    it('getOngoingSeason should return undefined when season already over', async () => {
        await knex('seasons').insert({ start: new Date(now - 2 * ONE_DAY), end: new Date(now - ONE_DAY) })
        const season = await getOngoingSeason()
        expect(season).not.toBeDefined()
    })

    it('getOngoingSeason should return undefined when season has not started yet', async () => {
        await knex('seasons').insert({ start: new Date(now + ONE_DAY), end: new Date(now + 2 * ONE_DAY) })
        const season = await getOngoingSeason()
        expect(season).not.toBeDefined()
    })
})