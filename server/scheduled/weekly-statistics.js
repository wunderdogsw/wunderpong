import { getMatches } from '../db/matches'
import { getLadder, getMostActivePlayer, getRatingDifferences } from '../utils'
import * as config from '../config'
import fetch from 'node-fetch'

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

const getLadderBeforeLastWeek = async (now) => {
    const from = new Date(now - config.ratingDecayTimeMilliseconds - ONE_WEEK)
    const to = new Date(now - ONE_WEEK)
    const matchesBeforeLastWeek = await getMatches(from, to)
    return getLadder(matchesBeforeLastWeek)
}

const getLeaderChange = (ladderNow, ladderBeforeLastWeek) => {
    if (ladderBeforeLastWeek.length === 0 || ladderNow[0].name !== ladderBeforeLastWeek[0].name) {
        return ladderNow[0]
    } else {
        return null
    }
}

const getStatistics = async () => {
    const now = Date.now()
    const matchesLastWeek = await getMatches(new Date(now - ONE_WEEK))
    if (matchesLastWeek.length === 0) {
        throw new Error('No data from last week')
    }
    const ladderNow = getLadder(await getMatches())
    const ladderBeforeLastWeek = await getLadderBeforeLastWeek(now)
    const ratingDiffs = getRatingDifferences(ladderNow, ladderBeforeLastWeek)
    return {
        matchCount: matchesLastWeek.length,
        mostActivePlayer: getMostActivePlayer(matchesLastWeek),
        biggestRatingGain: ratingDiffs[0],
        biggestRatingLoss: ratingDiffs.pop(),
        leaderChange: getLeaderChange(ladderNow, ladderBeforeLastWeek)
    }
}

const createWeeklyStatsMessage = (params) => {
    const { matchCount, mostActivePlayer, biggestRatingGain, biggestRatingLoss, leaderChange } = params
    const messages = [
        ':pingis::pingis: weekly *SMASHDOWN* statistics :pingis::pingis:',
        `• *${matchCount}* matches were played last week!`,
        `• The most active player was *${mostActivePlayer.name}* with ${mostActivePlayer.matches} games played`,
        `• :lion_face: of the week was *${biggestRatingGain.name}* with a net rating gain of *${biggestRatingGain.rating}* points`,
        `• :sheep: of the week was *${biggestRatingLoss.name}* with a net rating loss of *${biggestRatingLoss.rating}* points`
    ]
    if (leaderChange) {
        messages.push(`• We have a new scoreboard leader! *${leaderChange.name}* has taken the :crown: with *${leaderChange.rating}* points`)
    }
    return messages.join('\n')
}

export const postWeeklyStatisticsToSlack = async (webhookUrl) => {
    const statistics = await getStatistics()
    return fetch(webhookUrl, {
        method: 'POST',
        body: JSON.stringify({ text: createWeeklyStatsMessage(statistics) }),
        headers: { 'Content-Type': 'application/json' }
    })
}