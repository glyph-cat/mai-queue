import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import {
  DeviceKeyMismatchError,
  IncidentReportNotFoundError,
  MissingParameterError,
} from '~errors'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { getDeviceInfoInTransaction } from '~utils/backend/helpers/get-device-info'
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

    const {
      [Field.incidentReportId]: incidentReportId,
    } = req.query as unknown as APIRemoveIncidentReportHandlerParams

    if (!incidentReportId) {
      throw new MissingParameterError(Field.incidentReportId)
    }

    await runTransaction(async (tx) => {
      const deviceInfo = await getDeviceInfoInTransaction(tx, req)
      const docRef = DBCollection.IncidentReports.doc(incidentReportId)
      const incidentReportDoc = await tx.get(docRef)
      if (!incidentReportDoc.exists) {
        throw new IncidentReportNotFoundError(incidentReportId)
      }
      const incidentReportData = incidentReportDoc.data()
      if (incidentReportData[Field.deviceKey] !== deviceInfo.deviceKey) {
        throw new DeviceKeyMismatchError()
      }
      tx.delete(docRef)
    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
