import './initializer'

import cors from 'cors'
import express from 'express'
import * as functions from 'firebase-functions'
import { getPlayerData } from './get-player-data'

const expressApp = express()
expressApp.use(cors({ origin: true }))
// expressApp.get('/', (req, res) => { res.status(200).send('OK') })
expressApp.get('/getPlayerData', getPlayerData)

export const api = functions.https.onRequest(expressApp)
