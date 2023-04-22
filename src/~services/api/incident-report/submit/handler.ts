import { HttpMethod, isUndefined } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { IncidentReportType } from '~abstractions'
import { Field } from '~constants'
import { InvalidParameterError } from '~errors'
import { ARCADE_LIST } from '~services/arcade-info'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { createDocInTransaction } from '~utils/backend/helpers/create-doc-in-transaction'
import { getDeviceInfoInTransaction } from '~utils/backend/helpers/get-device-info'
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

    await runTransaction(async (tx) => {

      const deviceInfo = await getDeviceInfoInTransaction(tx, req)

      // TODO: [Mid-priority] May be add a cooldown time based on deviceKey as safeguard to prevent spam?
      // This would still require making API calls, which would not save a lot of cost.
      // This still needs more consideration and planning.

      await createDocInTransaction(tx, DBCollection.IncidentReports, {
        [Field.cTime]: DateTime.now(),
        [Field.deviceKey]: deviceInfo.deviceKey,
        [Field.incidentReportType]: incidentReportType,
        [Field.arcadeId]: arcadeId,
        [Field.incidentReportComment]: incidentReportComment,
        [Field.votes]: {},
      })

    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
