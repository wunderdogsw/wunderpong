import Elo from 'arpad'
import isSameWeek from 'date-fns/is_same_week'
import uniq from 'lodash.uniq'


export const getMatchesByWeek = matches => matches.reduce((res, match) => {
  const week = res[res.length - 1]
  if ( week && isSameWeek(week.startedAt, match.created_at) ) {
    week.matches.push(match)
    return res
  }

  const nextWeek = {
    startedAt: match.created_at,
    matches: [ match ],
  }
  res.push(nextWeek)
  return res
}, [])

const calculateRankings = (matches, previousPlayerList = {}) => {
  const elo = new Elo()
  return matches.reduce((playerList, match) => {
    const initialWinnerRating = playerList[match.winner] || previousPlayerList[match.winner] || 1500
    const initialLoserRating = playerList[match.loser] || previousPlayerList[match.loser] || 1500
    playerList[match.winner] = elo.newRatingIfWon(initialWinnerRating, initialLoserRating)
    playerList[match.loser] = elo.newRatingIfLost(initialLoserRating, initialWinnerRating)
    return playerList
  }, {})
}




export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)




export const getLadder = (matches) => {

    // Split matches into weeks
    const matchesByWeek = getMatchesByWeek(matches)

    // Calculate ranks per week and add decay
    const { rankingsWithDecay } = matchesByWeek.reduce((res, week) => {
      let {
        players,
        rankingsWithDecay: previousWeekRankings,
      } = res

      // Get rankings for the week
      const weekRankings = calculateRankings(week.matches, previousWeekRankings)
      // console.log('---- WEEK ----', week.startedAt)
      // console.log(weekRankings)
      // console.log(week.startedAt, `| players -> ${Object.keys(weekRankings).length} | matches -> ${week.matches.length}`)

      // Find people who didnt play that week
      const peopleWhoDidntPlay = players.filter(x => !Object.keys(weekRankings).includes(x))

      // Get 10 percent from those people ranks
      const rankToDistribute = peopleWhoDidntPlay.reduce((rank, player) => {
        rank += Math.round(previousWeekRankings[player] * 0.1)
        return rank
      }, 0)

      const rankPerPlayer = rankToDistribute / Object.keys(weekRankings).length

      const rankingsCombined = { ...previousWeekRankings, ...weekRankings}

      // Distribute decay rank between players and remove from those who didnt play
      const rankingsWithDecay = Object.entries(rankingsCombined).reduce((res, [name, ranking]) => {
        let newRanking = ranking
        if (peopleWhoDidntPlay.includes(name)) newRanking -= Math.round(newRanking * 0.1)
        else newRanking += rankPerPlayer
        res[name] = newRanking
        return res
      }, {})

      // Update players so we can keep track on who didnt play
      players = uniq([...players, ...Object.keys(weekRankings)])

      return {
        rankingsWithDecay,
        players,
      }
    }, {
      players: [],
      rankingsWithDecay: {},
    })

    // const ladder = calculateRankings(matches)
    const ladder = rankingsWithDecay

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
