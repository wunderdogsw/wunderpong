import app from '../App'
import supertest from 'supertest'
import { knex } from '../db'
import { getLadder } from '../db/players'
import { getMatches } from '../db/matches'

describe('app routes', () => {

    beforeEach(async () => {
        await knex('players').insert([
            { name: 'mickey' },
            { name: 'donald' },
            { name: 'goofy' },
        ])
        await knex('matches').insert([
            { winner: 'mickey', winner_rating: 1500, loser: 'goofy', loser_rating: 1500 },
            { winner: 'mickey', winner_rating: 1516, loser: 'donald', loser_rating: 1484 }
        ])
    })

    afterEach(async () => {
        await knex('matches').del().whereNotNull('id')
        await knex('players').del().whereNotNull('name')
    })

    describe('GET /api/matches', () => {

        it('returns match data from db', async () => {
            const response = await supertest(app).get('/api/matches')

            expect(response.body).toEqual([
                {
                    id: expect.any(Number),
                    created_at: expect.any(String),
                    loser: 'goofy',
                    loser_rating: 1500,
                    winner: 'mickey',
                    winner_rating: 1500
                },
                {
                    id: expect.any(Number),
                    created_at: expect.any(String),
                    loser: 'donald',
                    loser_rating: 1484,
                    winner: 'mickey',
                    winner_rating: 1516
                }
            ])
        })
    })

    describe('GET /api/ladder', () => {
        it('returns player list with ratings from db', async () => {
            const response = await supertest(app).get('/api/ladder')

            expect(response.body).toEqual([
                { name: 'mickey', rating: 1516 },
                { name: 'goofy', rating: 1500 },
                { name: 'donald', rating: 1484 }
            ])
        })
    })

    describe('POST /api/ladder', () => {
        it('returns player list with ratings for slack bot', async () => {
            const response = await supertest(app).post('/api/ladder')

            expect(response.body).toEqual({
                text: '>>> \n1. mickey 👑\n2. goofy\n3. donald'
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
                '{"text":"Got it, scrooge won donald 🏆 \\n _ps. if you made a mistake, DON\'T make mistakes!_"}')
        })

        it('returns http 500 if player tries to add match against himself / herself', async () => {
            const res = await supertest(app)
                .post('/api/match')
                .send('text=\'donald donald\'')
            expect(res.status).toBe(500)
        })

        it('updates players table', async () => {
            expect(await getLadder()).toEqual([
                { name: 'mickey', rating: 1516 },
                { name: 'scrooge', rating: 1515 },
                { name: 'goofy', rating: 1500 },
                { name: 'donald', rating: 1469 }
            ])
        })

        it('updates match table', async () => {
            const matches = await getMatches()
            const { id, created_at, ...latestMatch } = matches.pop()
            expect(id).toBeGreaterThan(0)
            expect(new Date(created_at).toLocaleDateString()).toEqual(new Date().toLocaleDateString())
            expect(latestMatch).toEqual({
                loser: 'donald',
                loser_rating: 1469,
                winner: 'scrooge',
                winner_rating: 1515
            })
        })
    })

    describe('POST /api/match/undo', () => {

        describe('success', async () => {
            let response

            beforeEach(async () => {
                response = await supertest(app)
                    .post('/api/match/undo')
                    .send('text=\'mickey\'')
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
                        loser: 'goofy',
                        loser_rating: 1500,
                        winner: 'mickey',
                        winner_rating: 1500
                    }
                )
            })

            it('adjusts rating in players table as if the match never happened', async () => {
                expect(await getLadder()).toEqual([
                    { name: 'donald', rating: 1500 },
                    { name: 'goofy', rating: 1500 },
                    { name: 'mickey', rating: 1500 }
                ])
            })
        })

        describe('fail', () => {
            let response

            beforeEach(async () => {
                response = await supertest(app)
                    .post('/api/match/undo')
                    .send('text=\'goofy\'')
            })

            it('returns http 500 if match to be deleted is not both players\' latest match', async () => {
                expect(response.status).toBe(500)
            })

            it('does not delete requested match', async () => {
                expect((await getMatches()).length).toBe(2)
            })
        })
    })
})
