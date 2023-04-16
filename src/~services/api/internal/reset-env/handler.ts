import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { ENV } from '~constants'
import { InternalAPIError } from '~errors'
import { DBCollection } from '~services/firebase-admin'
import { performBasicChecks } from '~utils/backend/helpers'
import { BatchOperator } from '~utils/backend/helpers/batch-operator'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
} from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'

export default async function APIResetEnvHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIResetEnvHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.DELETE])
    if (ENV.VERCEL_ENV === 'production') {
      throw new InternalAPIError('Cannot reset in production env')
    }
    const batch = new BatchOperator()
    await batch.deleteCollection(DBCollection.Devices)
    await batch.deleteCollection(DBCollection.Tickets)
    await batch.deleteCollection(DBCollection.SwapRequests)
    await batch.deleteCollection(DBCollection.IncidentReports)
    await batch.commit()
    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
