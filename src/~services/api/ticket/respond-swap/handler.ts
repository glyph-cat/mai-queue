import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { DocumentSnapshot } from '@google-cloud/firestore'
import { firestore } from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'
import { ITicketsModelObject, SwapRequestStatus } from '~abstractions'
import { Field } from '~constants'
import {
  DeviceKeyMismatchError,
  InvalidParameterError,
  MissingParameterError,
  SwapRequestAlreadyClosedError,
  SwapRequestNotFoundError,
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
import { APIRespondSwapRequestHandlerParams } from './abstractions'

export default async function APICancelSwapTicketHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APICancelSwapTicketHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])

    const {
      [Field.swapRequestId]: swapRequestId,
      [Field.swapRequestStatus]: rawResponseStatus,
    } = req.query as unknown as APIRespondSwapRequestHandlerParams

    if (!swapRequestId) {
      throw new MissingParameterError(Field.swapRequestId)
    }
    if (!rawResponseStatus) {
      throw new MissingParameterError(Field.swapRequestStatus)
    }

    await runTransaction(async (tx) => {

      const deviceInfo = await getDeviceInfoInTransaction(tx, req)

      const swapRequestQuery = await tx.get(DBCollection.SwapRequests.doc(swapRequestId))
      if (!swapRequestQuery.exists) {
        throw new SwapRequestNotFoundError()
      }
      const swapRequestData = swapRequestQuery.data()
      if (swapRequestData[Field.swapRequestStatus] !== SwapRequestStatus.PENDING) {
        throw new SwapRequestAlreadyClosedError(swapRequestData[Field.swapRequestStatus])
      }

      const ticketsQuery: Array<DocumentSnapshot<ITicketsModelObject>> = await tx.getAll(
        DBCollection.Tickets.doc(swapRequestData[Field.sourceTicketId]),
        DBCollection.Tickets.doc(swapRequestData[Field.targetTicketId]),
      )
      const sourceTicketQuery = ticketsQuery.find((value) => {
        return value.id === swapRequestData[Field.sourceTicketId]
      })
      const targetTicketQuery = ticketsQuery.find((value) => {
        return value.id === swapRequestData[Field.targetTicketId]
      })

      if (!targetTicketQuery.exists) {
        throw new TicketNotFoundError(swapRequestData[Field.targetTicketId])
      }
      const targetTicketData = targetTicketQuery.data()
      if (targetTicketData[Field.deviceKey] !== deviceInfo.deviceKey) {
        throw new DeviceKeyMismatchError()
      }
      if (!sourceTicketQuery.exists) {
        throw new TicketNotFoundError(swapRequestData[Field.sourceTicketId])
      }
      const sourceTicketData = sourceTicketQuery.data()

      const responseStatus = Number(rawResponseStatus) as SwapRequestStatus
      if (responseStatus === SwapRequestStatus.ACCEPTED) {
        tx.update(DBCollection.Tickets.doc(swapRequestData[Field.sourceTicketId]), {
          [Field.ticketNumber]: Number(targetTicketData[Field.ticketNumber]),
        })
        tx.update(DBCollection.Tickets.doc(swapRequestData[Field.targetTicketId]), {
          [Field.ticketNumber]: Number(sourceTicketData[Field.ticketNumber]),
        })
        tx.update(DBCollection.SwapRequests.doc(swapRequestId), {
          [Field.swapRequestStatus]: responseStatus,
        })
      } else if (responseStatus === SwapRequestStatus.DECLINED) {
        tx.update(DBCollection.SwapRequests.doc(swapRequestId), {
          [Field.swapRequestStatus]: responseStatus,
          [Field.declineCount]: firestore.FieldValue.increment(1),
        })
      } else {
        throw new InvalidParameterError(Field.swapRequestStatus, responseStatus)
      }
    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
