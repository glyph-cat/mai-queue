import { HttpStatus } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { ENV } from '~constants'
import { DBCollection } from '~services/firebase-admin'
import { BatchOperator } from '~utils/backend/helpers/batch-operator'
import { emptyResponse } from '~utils/backend/response-handlers'
import { devError, devInfo } from '~utils/dev'

export default async function APIDailyResetHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIDailyResetHandler.name}`)
  if (req.query?.api_key !== ENV.APP_API_KEY) {
    devError('Invalid API key')
    res.status(HttpStatus.NOT_FOUND).end()
    return // Early exit
  }
  const batch = new BatchOperator()
  await batch.deleteCollection(DBCollection.Tickets)
  await batch.deleteCollection(DBCollection.SwapRequests)
  await batch.deleteCollection(DBCollection.IncidentReports)
  await batch.commit()
  // Player banners on Cloud Storage are handled separately
  // https://cloud.google.com/storage/docs/managing-lifecycles#console
  return emptyResponse(res)
}
