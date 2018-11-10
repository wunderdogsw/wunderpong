import app from '../App'
import supertest from 'supertest'
import { knex } from '../db'
import { getMatches } from '../db/matches'

const now = Date.now()

const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000)

describe('app routes', () => {

    beforeEach(async () => {
        await knex('matches').insert([
            { winner: 'mickey', loser: 'goofy', created_at: daysAgo(2) },
            { winner: 'mickey', loser: 'donald', created_at: daysAgo(1) }
        ])
    })

    afterEach(async () => {
        await knex('matches').del().whereNotNull('id')
    })

    describe('GET /api/matches', () => {

        it('returns match data from db', async () => {
            const response = await supertest(app).get('/api/matches')

            expect(response.body).toEqual([
                {
                    id: expect.any(Number),
                    created_at: expect.any(String),
                    loser: 'goofy',
                    winner: 'mickey',
                },
                {
                    id: expect.any(Number),
                    created_at: expect.any(String),
                    loser: 'donald',
                    winner: 'mickey',
                }
            ])
        })
    })

    describe('GET /api/ladder', () => {
        it('returns player list with ratings from db', async () => {
            const response = await supertest(app).get('/api/ladder')

            expect(response.body).toEqual([
                { name: 'mickey', rating: 1531 },
                { name: 'donald', rating: 1485 },
                { name: 'goofy', rating: 1484 },
            ])
        })
    })

    describe('POST /api/ladder', () => {
        it('returns player list with ratings for slack bot', async () => {
            const response = await supertest(app).post('/api/ladder')

            expect(response.body).toEqual({
                text: '>>> \n1. mickey 👑\n2. donald\n3. goofy'
            })
        })
    })

    describe('POST /api/match', () => {
        let response

        beforeEach(async () => {
            response = await supertest(app)
                .post('/api/match')
                .send('text=\'SCROOGE donald\'')
        })

        it('returns http 200 with correct text', async () => {
            expect(response.status).toBe(200)
            expect(response.text).toEqual(
                '{"text":"Got it, scrooge won donald 🏆 \\n _ps. if you made a mistake, use /pingpongundo [nick] to cancel the result and try again._"}')
        })

        it('returns http 400 if player tries to add match against himself / herself', async () => {
            const res = await supertest(app)
                .post('/api/match')
                .send('text=\'donald donald\'')
            expect(res.status).toBe(400)
        })

        it('updates players table', async () => {
            const ladder = await supertest(app).get('/api/ladder')
            expect(JSON.parse(ladder.text)).toEqual([
                { name: 'mickey', rating: 1531 },
                { name: 'scrooge', rating: 1515 },
                { name: 'goofy', rating: 1484 },
                { name: 'donald', rating: 1470 }
            ])
        })

        it('updates match table', async () => {
            const matches = await getMatches()
            const { id, created_at, ...latestMatch } = matches.pop()
            expect(id).toBeGreaterThan(0)
            expect(new Date(created_at).toLocaleDateString()).toEqual(new Date().toLocaleDateString())
            expect(latestMatch).toEqual({
                loser: 'donald',
                winner: 'scrooge',
            })
        })
    })

    describe('POST /api/match/undo', () => {

        let response

        beforeEach(async () => {
            response = await supertest(app)
                .post('/api/match/undo')
                .send('text=\'goofy\'')
        })

        it('returns http 200 with correct text', async () => {
            expect(response.status).toBe(200)
            expect(response.text).toEqual(
                '{"text":"Your latest match result has been cancelled. You can now submit the corrected result."}'
            )
        })

        it('deletes latest match from matches table', async () => {
            const matches = await getMatches()
            expect(matches.length).toBe(1)
            expect(matches[0]).toEqual(
                {
                    id: expect.any(Number),
                    created_at: expect.any(Date),
                    loser: 'donald',
                    winner: 'mickey',
                }
            )
        })

        it('adjusts rating in players table as if the match never happened', async () => {
            const ladder = await supertest(app).get('/api/ladder')
            expect(ladder.body).toEqual([
                { name: 'mickey', rating: 1516 },
                { name: 'donald', rating: 1484 }
            ])
        })
    })
})
