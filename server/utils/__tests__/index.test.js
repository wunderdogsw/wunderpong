import { getLadder, getMostActivePlayer, getRatingDifferences } from '../index'

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

describe('getMostActivePlayer', () => {

    const matches = [
        { winner: 'daisy', loser: 'goofy' },
        { winner: 'goofy', loser: 'daisy' },
        { winner: 'minnie', loser: 'daisy' },
        { winner: 'minnie', loser: 'goofy' },
        { winner: 'daisy', loser: 'scrooge' },
    ]

    it('returns player with most games', () => {
        expect(getMostActivePlayer(matches)).toEqual({ name: 'daisy', matches: 4 })
    })
})

describe('getRatingDifferences', () => {

    const ladderOld = [
        { name: 'minnie', rating: 1758 },
        { name: 'daisy', rating: 1699 },
        { name: 'goofy', rating: 1504 },
    ]

    const ladderNew = [
        { name: 'daisy', rating: 1732 },
        { name: 'minnie', rating: 1620 },
        { name: 'scrooge', rating: 1519 },
        { name: 'goofy', rating: 1499 },
        { name: 'donald', rating: 1329 },
    ]

    it('returns list of players with rating differences (net gain & net loss)', () => {
        expect(getRatingDifferences(ladderNew, ladderOld)).toEqual([
            { name: 'daisy', rating: 33 },
            { name: 'scrooge', rating: 19 },
            { name: 'goofy', rating: -5 },
            { name: 'minnie', rating: -138 },
            { name: 'donald', rating: -171 },
        ])
    })
})