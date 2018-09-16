import { fetchJson } from './helpers'



const API_URL = process.env.NODE_ENV === 'production' ?
  process.env.PRODUCTION_API_URL :
  'http://localhost:3000/api'


export const getLadder = () => fetchJson(`${API_URL}/ladder`)
