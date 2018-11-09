export * from './face-recognitor'
import Elo from 'arpad'

export * from './image-utils'

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export const getLadder = (matches) => {
    const elo = new Elo()
    const ladder = matches.reduce((playerList, match) => {
        const initialWinnerRating = playerList[match.winner] || 1500
        const initialLoserRating = playerList[match.loser] || 1500
        playerList[match.winner] = elo.newRatingIfWon(initialWinnerRating, initialLoserRating)
        playerList[match.loser] = elo.newRatingIfLost(initialLoserRating, initialWinnerRating)
        return playerList
    }, {})
    return Object.keys(ladder)
        .map(name => ({ name, rating: ladder[name] }))
        .sort((a, b) => b.rating - a.rating)
}
