import './initializer'

import cors from 'cors'
import express from 'express'
import * as functions from 'firebase-functions'
import { getPlayerData as getPlayerData_fn } from './get-player-data'

function withCors(handler) {
  const app = express()
  app.use(cors({ origin: true }))
  app.get('/', handler)
  return app
}

export const getPlayerData = functions
  .runWith({ memory: '512MB' })
  .https.onRequest(withCors(getPlayerData_fn))

export const hello = functions.https.onRequest(withCors((req, res) => {
  res.status(200).send('Hello')
}))
