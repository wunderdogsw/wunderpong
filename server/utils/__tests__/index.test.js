import { getLadder } from '../index'

describe('getLadder', () => {
    it('calculates ladder from match data', () => {
        const matches = [
            { winner: 'mickey', loser: 'goofy' },
            { winner: 'mickey', loser: 'donald' }
        ]
        expect(getLadder(matches)).toEqual([
            { name: 'mickey', rating: 1531 },
            { name: 'donald', rating: 1485 },
            { name: 'goofy', rating: 1484 },
        ])
    })
})