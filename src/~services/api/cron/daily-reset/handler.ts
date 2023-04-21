import { NextApiRequest, NextApiResponse } from 'next'
import { DBCollection } from '~services/firebase-admin'
import { BatchOperator } from '~utils/backend/helpers/batch-operator'
import { emptyResponse } from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'

export default async function APIDailyResetHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIDailyResetHandler.name}`)
  const batch = new BatchOperator()
  await batch.deleteCollection(DBCollection.Tickets)
  await batch.deleteCollection(DBCollection.SwapRequests)
  await batch.deleteCollection(DBCollection.IncidentReports)
  await batch.commit()
  // Player banners on Cloud Storage are handled separately
  // https://cloud.google.com/storage/docs/managing-lifecycles#console
  return emptyResponse(res)
}
