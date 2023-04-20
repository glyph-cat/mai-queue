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
import { APISubmitIncidentReportHandlerParams } from './abstractions'

export default async function APISubmitIncidentReportHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APISubmitIncidentReportHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.POST])
    // ...
    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
