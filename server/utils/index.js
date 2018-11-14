import Elo from 'arpad'

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

export const getMostActivePlayer = (matches) => {
    const matchesPlayed = {}
    for (const match of matches) {
        if (!matchesPlayed[match.winner]) {
            matchesPlayed[match.winner] = 0
        }
        if (!matchesPlayed[match.loser]) {
            matchesPlayed[match.loser] = 0
        }
        matchesPlayed[match.winner]++
        matchesPlayed[match.loser]++
    }
    return Object.keys(matchesPlayed)
        .map(name => ({ name, matches: matchesPlayed[name] }))
        .sort((a, b) => a.matches - b.matches)
        .pop()
}

export const getRatingDifferences = (ladderNew, ladderOld) => {
    return ladderNew.map(({ name, rating }) => {
        const old = ladderOld.find(old => old.name === name) || { name, rating: 1500 }
        return {
            name,
            rating: rating - old.rating
        }
    }).sort((a, b) => b.rating - a.rating)
}
