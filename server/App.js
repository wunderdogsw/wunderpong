import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import uniq from 'lodash.uniq'
import flatten from 'lodash.flatten'
import { postMatch, getMatches, deleteMatch } from './db/matches'
import { asyncHandler, getLadder } from './utils'
import cron from 'node-cron'
import * as config from './config'
import { postWeeklyStatisticsToSlack } from './scheduled/weekly-statistics'

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('dist/client'))

if (config.slackWebhookURL) {
  console.log('Scheduling to post weekly statistics at 08:00 every friday.')
  cron.schedule('0 8 * * Friday', async () => {
    try {
      await postWeeklyStatisticsToSlack(config.slackWebhookURL)
    } catch (err) {
      console.error(err)
    }
  }, { timezone: 'Europe/Helsinki' })
}

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

app.get('*', (_, res) => {
  res.sendFile(path.resolve('./dist/client/index.html'))
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err)
  res.sendStatus(500)
})

export default app
