import { HttpMethod, isNumber, isUndefined } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { VoteType } from '~abstractions/vote'
import { Field } from '~constants'
import {
  IncidentReportNotFoundError,
  InvalidParameterError,
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
import { APIVoteOnIncidentReportHandlerParams } from './abstractions'

export default async function APIVoteOnIncidentReportHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIVoteOnIncidentReportHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])

    const {
      [Field.incidentReportId]: incidentReportId,
      [Field.voteType]: voteType,
    } = req.body as APIVoteOnIncidentReportHandlerParams

    if (!incidentReportId) {
      throw new MissingParameterError(Field.incidentReportId)
    }

    if (isUndefined(VoteType[voteType])) {
      throw new InvalidParameterError(Field.voteType, voteType)
    }

    await runTransaction(async (tx) => {
      const deviceInfo = await getDeviceInfoInTransaction(tx, req)
      const docRef = DBCollection.IncidentReports.doc(incidentReportId)
      const incidentReportDoc = await tx.get(docRef)
      if (!incidentReportDoc.exists) {
        throw new IncidentReportNotFoundError(incidentReportId)
      }
      const incidentReportData = incidentReportDoc.data()
      if (voteType === VoteType.WITHDRAW) {
        const {
          [deviceInfo.deviceKey]: _voteToRemove,
          ...remainingVotes
        } = incidentReportData[Field.votes]
        tx.update(docRef, { [Field.votes]: remainingVotes })
      } else {
        tx.update(docRef, {
          [Field.votes]: {
            ...incidentReportData[Field.votes],
            [deviceInfo.deviceKey]: voteType,
          },
        })
      }
    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
