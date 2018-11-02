import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import uniq from 'lodash.uniq'
import flatten from 'lodash.flatten'
import {
  postMatch,
  getMatches,
  getPlayer,
  getMigrations,
  getLadder,
} from 'Server/api'
import {
  whoIsIt,
  saveImage,
  removeImage,
} from 'Server/utils'
import Elo from 'arpad'
const elo = new Elo()


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

  const playerNames = text
    .split(' ')
    .filter(x => Boolean(x.trim()))
    .map(x => x.toLowerCase().trim().replace(/[^a-z_]/gi, ''))

  if (playerNames.length !== 2) {
    return res.sendStatus(400)
  }

  const winner = await getPlayer(playerNames[0])
  const loser = await getPlayer(playerNames[1])
  const new_winner_rating = elo.newRatingIfWon(winner.rating, loser.rating)
  const new_loser_rating = elo.newRatingIfLost(loser.rating, winner.rating)

  try {
    await postMatch({name: winner.name, rating: new_winner_rating}, {name: loser.name, rating: new_loser_rating})
    res.status(200).json({
      text: `Got it, ${winner.name.replace(/_{1,}/gi, ' ')} won ${loser.name.replace(/_{1,}/gi, ' ')} 🏆 \n _ps. notify luffis if you made a mistake_`
    })
  } catch (error) {
    console.error('[ERROR]', error)
    res.sendStatus(500)
  }
})

app.get('/api/matches', async (req, res) => {
  console.info('GET /api/matches')
  try {
    const matches = await getMatches()
    res.status(200).json(matches)
  } catch (error) {
    console.error('[ERROR]', error)
    res.sendStatus(500)
  }
})

app.post('/api/ladder', async (req, res) => {
  console.info('POST /api/ladder')
  let ladder
  try {
    ladder = await getLadder()
  } catch (error) {
    console.error('[ERROR]', error)
    return res.sendStatus(500)
  }
  res.status(200).json({
    text: '>>> \n' + ladder
      .map((player, i) => `${i+1}. ${player.name}${i === 0 ? ' 👑' : ''}`)
      .join('\n')
  })
})

app.get('/api/ladder', async (req, res) => {
  console.info('GET /api/ladder')
  try {
    const ladder = await getLadder()
    res.status(200).json(ladder)
  } catch (error) {
    console.error('[ERROR]', error)
    return res.sendStatus(500)
  }
})

app.get('/api/players', async (req, res) => {
  console.info('GET /api/players')
  let matches
  try {
    matches = await getMatches()
  } catch (error) {
    console.error('[ERROR]', error)
    return res.sendStatus(500)
  }
  const players = uniq(flatten(matches.map(x => [x.winner, x.loser]))).sort()
  res.status(200).json(players)
})

app.post('/api/whoisit', async (req, res) => {
    console.log('POST /api/whoisit')

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
})

app.get('/api/foobar', async(req, res) => {
  res.json(await getMigrations())
})


app.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname + '/../client/index.html'))
})

export default app
