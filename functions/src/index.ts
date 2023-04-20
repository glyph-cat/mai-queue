import './initializer'

import cors from 'cors'
import express, { Request, Response } from 'express'
import * as functions from 'firebase-functions'
import { getPlayerData as getPlayerData_fn } from './get-player-data'


function withCors(handler: (req: Request, res: Response) => unknown) {
  const app = express()
  app.use(cors({ origin: true }))
  app.get('/', handler)
  return app
}

// export const ping = functions.https.onRequest(withCors((req, res) => {
//   res.status(204).send()
// }))

export const getPlayerData = functions
  .runWith({ memory: '512MB' })
  .https.onRequest(withCors(getPlayerData_fn))
