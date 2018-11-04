import app from '../App'
import supertest from 'supertest'
import db from '../db/db'
import { getLadder, getMatches } from '../api';

describe('app routes', () => {

    beforeEach(async () => {
        await db.query(
            'INSERT INTO players ("name") VALUES (\'mickey\'), (\'donald\'), (\'goofy\')'
        )
        await db.query(
            `INSERT INTO matches ("winner", "winner_rating", "loser", "loser_rating") 
             VALUES (\'mickey\', 1516, \'donald\', 1484)`
        )
    })

    afterEach(async () => {
        await db.query('DELETE FROM matches WHERE id IS NOT NULL')
        await db.query('DELETE FROM players WHERE name IS NOT NULL')
    })

    describe('GET /api/matches', () => {

        it('returns match data from db', async () => {
            const response = await supertest(app).get('/api/matches')

            const { id: id, created_at: created, ...rest } = response.body[0]
            expect(id).toBeGreaterThan(0)
            expect(new Date(created).toLocaleDateString()).toEqual(new Date().toLocaleDateString())
            expect(rest).toEqual({
                loser: 'donald',
                loser_rating: 1484,
                winner: 'mickey',
                winner_rating: 1516
            })
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
                text: `>>> \n1. mickey 👑\n2. goofy\n3. donald`
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
                '{"text":\"Got it, scrooge won donald 🏆 \\n _ps. if you made a mistake, DON\'T make mistakes!_"}')
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
            const { id: id, created_at: created, ...latestMatch } = matches.pop()
            expect(latestMatch).toEqual({
                loser: 'donald',
                loser_rating: 1469,
                winner: 'scrooge',
                winner_rating: 1515
            })
        })
    })
})