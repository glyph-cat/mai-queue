import { HttpMethod, isUndefined } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { IncidentReportType } from '~abstractions'
import { Field } from '~constants'
import { InvalidParameterError } from '~errors'
import { ARCADE_LIST } from '~services/arcade-info'
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

    const {
      [Field.incidentReportType]: incidentReportType,
      [Field.arcadeId]: arcadeId,
      [Field.incidentReportComment]: incidentReportComment,
    } = req.body as APISubmitIncidentReportHandlerParams

    if (!ARCADE_LIST[arcadeId]) {
      throw new InvalidParameterError(Field.arcadeId, arcadeId)
    }

    if (isUndefined(IncidentReportType[incidentReportType])) {
      throw new InvalidParameterError(Field.incidentReportType, incidentReportType)
    }

    // TODO: [Mid-priority] May be add a cooldown time as safeguard to prevent spam?

    await DBCollection.IncidentReports.add({
      [Field.cTime]: DateTime.now(),
      [Field.incidentReportType]: incidentReportType,
      [Field.arcadeId]: arcadeId,
      [Field.incidentReportComment]: incidentReportComment,
      [Field.votes]: {},
    })
    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
