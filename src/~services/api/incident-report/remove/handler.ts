import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-admin'
import { performBasicChecks } from '~utils/backend/helpers'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
} from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'
import { APIRemoveIncidentReportHandlerParams } from './abstractions'

export default async function APIRemoveIncidentReportHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIRemoveIncidentReportHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.DELETE])
    // ...
    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
