import {
  fetchJson,
  sanitizeName,
} from './helpers'



const API_URL = process.env.NODE_ENV === 'production' ?
  (process.env.PRODUCTION_API_URL || '/api') :
  (process.env.DEVELOPMENT_API_URL || 'http://localhost:3000/api')

const FACE_RECOGNITION_URL =
  process.env.FACE_RECOGNITION_URL ||
  'https://face-recognitor.lab.wunder.dog'


export const getLadder = () => fetchJson(`${API_URL}/ladder`)
export const getPlayers = () => fetchJson(`${API_URL}/players`)
export const postMatch = (winner, loser) => fetchJson(`${API_URL}/match`, {
  method: 'POST',
  body: JSON.stringify({ text: `${sanitizeName(winner)} ${sanitizeName(loser)}`})
})
export const postScreenshot = image => fetchJson(`${FACE_RECOGNITION_URL}/whoisit`, {
  method: 'POST',
  body: JSON.stringify({ image })
})
