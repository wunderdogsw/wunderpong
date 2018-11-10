import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import uniq from 'lodash.uniq'
import flatten from 'lodash.flatten'
import { postMatch, getMatches, deleteMatch } from './db/matches'
import { asyncHandler, getLadder, getRatingDifferences, getMostActivePlayer } from './utils'
import * as config from './config'
// Uncomment to enable face recognition
// import {
//   whoIsIt,
//   saveImage,
//   removeImage,
// } from 'Server/utils'

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('dist/client'))



app.post('/api/match', async (req, res) => {
  console.info('POST /api/match')

  const {
    text,
  } = req.body

  if (!text) {
    return res.sendStatus(400)
  }

  const players = text
    .split(' ')
    .filter(x => Boolean(x.trim()))
    .map(x => x.toLowerCase().trim().replace(/[^a-z_]/gi, ''))

  if (players.length !== 2) {
    return res.sendStatus(400)
  }

  const winner = players[0]
  const loser = players[1]

  if (winner === loser) {
    return res.sendStatus(400)
  }

  await postMatch(winner, loser)
  res.status(200).json({
    text: `Got it, ${winner.replace(/_{1,}/gi, ' ')} won ${loser.replace(/_{1,}/gi, ' ')} 🏆 \n _ps. if you made a mistake, use /pingpongundo [nick] to cancel the result and try again._`
  })
})

app.post('/api/match/undo', asyncHandler(async (req, res) => {
  const { text } = req.body
  const player = text.trim().replace(/[^a-z_]/gi, '')
  await deleteMatch(player)
  res.status(200).json({
    text: 'Your latest match result has been cancelled. You can now submit the corrected result.'
  })
}))

app.get('/api/matches', asyncHandler(async (req, res) => {
  console.info('GET /api/matches')
  const matches = await getMatches()
  res.status(200).json(matches)
}))

app.post('/api/ladder', asyncHandler(async (req, res) => {
  console.info('POST /api/ladder')
  const matches = await getMatches()
  const ladder = getLadder(matches)
  res.status(200).json({
    text: '>>> \n' + ladder
      .map((player, i) => `${i + 1}. ${player.name}${i === 0 ? ' 👑' : ''}`)
      .join('\n')
  })
}))

app.get('/api/ladder', asyncHandler(async (req, res) => {
  console.info('GET /api/ladder')
  const matches = await getMatches()
  const ladder = getLadder(matches)
  res.status(200).json(ladder)
}))

app.get('/api/players', asyncHandler(async (req, res) => {
  console.info('GET /api/players')
  const matches = await getMatches()
  const players = uniq(flatten(matches.map(x => [x.winner, x.loser]))).sort()
  res.status(200).json(players)
}))

app.post('/api/weekly-stats', asyncHandler(async (req, res) => {
  const now = Date.now()

  //get latest data
  const matches = await getMatches()
  const ladderNow = getLadder(matches)

  //get data before this week
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const from = new Date(now - config.ratingDecayTimeMilliseconds - oneWeek)
  const to = new Date(now - oneWeek)
  const matchesBeforeLastWeek = await getMatches(from, to)
  const ladderBeforeLastWeek = getLadder(matchesBeforeLastWeek)

  //get statistics & post to slack
  const matchesLastWeek = await getMatches(new Date(now - oneWeek))
  const mostActivePlayer = getMostActivePlayer(matchesLastWeek)
  const ratingDiffs = getRatingDifferences(ladderNow, ladderBeforeLastWeek)
  const biggestRatingGain = ratingDiffs[0]
  const biggestRatingLoss = ratingDiffs.pop()
  
  const messages = [
    ':pingis::pingis: weekly *SMASHDOWN* statistics :pingis::pingis:',
    `• *${matches.length}* matches were played last week!`,
    `• The most active player was *${mostActivePlayer.name}* with ${mostActivePlayer.matches} games played`,
    `• :lion_face: of the week was *${biggestRatingGain.name}* with a net rating gain of *${biggestRatingGain.rating}* points`,
    `• :sheep: of the week was *${biggestRatingLoss.name}* with a net rating loss of *${biggestRatingLoss.rating}* points`
  ]
  if (ladderBeforeLastWeek.length === 0 || ladderNow[0].name !== ladderBeforeLastWeek[0].name) {
    const from = ladderBeforeLastWeek[0] ? ` from ${ladderBeforeLastWeek[0].name} ` : ' '
    messages.push(`• We have a new scoreboard leader! *${ladderNow[0].name}* has taken :crown:${from}with *${ladderNow[0].rating}* points`)
  }
  return res.status(200).json({ text: messages.filter(msg => !!msg).join('\n') })
}))

app.post('/api/whoisit', asyncHandler(async (req, res) => {
  console.log('POST /api/whoisit')

  // Uncomment following to enable face recognition
  // Requires "face-recognition": "^0.9.3" in package.json
  /*
  const { image } = req.body
  if (!image) return res.sendStatus(400)

  const imagePath = await saveImage(new Buffer(image.split(',')[1], 'base64'))

  let players
  try {
    players = whoIsIt(imagePath)
  } catch(error) {
    console.error('[ERROR]', error)
    return res.sendStatus(500)
  }

  removeImage(imagePath)
  res.json({ players })
  */

  // Remove next line if using face recognition
  res.json({ players: [] })
}))

app.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname + '/../dist/client/index.html'))
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err)
  res.sendStatus(500)
})

export default app
