import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { firestore } from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import {
  DeviceKeyMismatchError,
  MissingParameterError,
  TicketAlreadyClosedError,
  TicketNotFoundError,
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
import { APICloseTicketHandlerParams } from './abstractions'

export default async function APICloseTicketHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APICloseTicketHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])

    const {
      [Field.ticketId]: ticketId,
      [Field.xReason]: closeTicketReason,
    } = req.query as unknown as APICloseTicketHandlerParams

    if (!ticketId) {
      throw new MissingParameterError(Field.ticketId)
    }

    if (!closeTicketReason) {
      throw new MissingParameterError(Field.xReason)
    }

    await runTransaction(async (tx) => {
      const deviceInfo = await getDeviceInfoInTransaction(tx, req)
      const ticketSnapshot = await tx.get(DBCollection.Tickets.doc(ticketId))
      if (!ticketSnapshot.exists) {
        throw new TicketNotFoundError(ticketId)
      }
      const ticketData = ticketSnapshot.data()
      if (ticketData[Field.deviceKey] !== deviceInfo.deviceKey) {
        throw new DeviceKeyMismatchError()
      }
      if (ticketData[Field.xTime]) {
        throw new TicketAlreadyClosedError(ticketData[Field.ticketNumber])
      }
      tx.update(DBCollection.Tickets.doc(ticketId), {
        [Field.xTime]: firestore.Timestamp.now(),
        [Field.xReason]: Number(closeTicketReason),
      })
    })
    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
