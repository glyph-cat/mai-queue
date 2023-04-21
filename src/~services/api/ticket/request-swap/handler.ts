import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { DocumentSnapshot } from '@google-cloud/firestore'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { ITicketsModelObject, SwapRequestStatus } from '~abstractions'
import { Field, MAX_ALLOWED_SWAP_REQUEST_RETRY_COUNT } from '~constants'
import {
  DeviceKeyMismatchError,
  InvalidTicketIdError,
  MissingParameterError,
  SwapRequestDeclineLimitError,
  TicketAlreadyClosedError,
  TicketNotFoundError,
  UnresolvedSwapRequestError,
} from '~errors'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { createDocInTransaction } from '~utils/backend/helpers/create-doc-in-transaction'
import { getDeviceInfoInTransaction } from '~utils/backend/helpers/get-device-info'
import {
  genericTryCatchErrorResponseHandler,
  simpleResponse,
} from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'
import {
  APIRequestSwapTicketHandlerParams,
  APIRequestSwapTicketHandlerReturnData,
} from './abstractions'

export default async function APIRequestSwapTicketHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIRequestSwapTicketHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])
    const {
      [Field.targetTicketId]: targetTicketId,
      [Field.sourceTicketId]: sourceTicketId,
    } = req.query as unknown as APIRequestSwapTicketHandlerParams

    if (!targetTicketId) {
      throw new MissingParameterError(Field.targetTicketId)
    }
    if (!sourceTicketId) {
      throw new MissingParameterError(Field.sourceTicketId)
    }

    const swapRequestId = await runTransaction(async (tx) => {

      const deviceInfo = await getDeviceInfoInTransaction(tx, req)

      const ticketsQuery: Array<DocumentSnapshot<ITicketsModelObject>> = await tx.getAll(
        DBCollection.Tickets.doc(sourceTicketId),
        DBCollection.Tickets.doc(targetTicketId),
      )
      const sourceTicketQuery = ticketsQuery.find((value) => value.id === sourceTicketId)
      const targetTicketQuery = ticketsQuery.find((value) => value.id === targetTicketId)
      if (!sourceTicketQuery.exists) {
        throw new TicketNotFoundError(sourceTicketId, 'Source')
      }
      const sourceTicketData = sourceTicketQuery.data()
      if (sourceTicketData[Field.deviceKey] !== deviceInfo.deviceKey) {
        throw new DeviceKeyMismatchError()
      } else {
        if (sourceTicketData[Field.xTime]) {
          throw new TicketAlreadyClosedError(sourceTicketData[Field.ticketNumber], 'Source')
        }
      }
      if (!targetTicketQuery.exists) {
        throw new TicketNotFoundError(targetTicketId, 'Target')
      } else {
        const targetTicketData = targetTicketQuery.data()
        if (targetTicketData[Field.xTime]) {
          throw new TicketAlreadyClosedError(targetTicketData[Field.ticketNumber], 'Target')
        }
      }

      const selfUnresolvedOutgoingRequests = await tx.get(DBCollection.SwapRequests
        .where(Field.sourceTicketId, '==', sourceTicketId)
        .where(Field.swapRequestStatus, '==', SwapRequestStatus.PENDING)
        .limit(1))
      if (!selfUnresolvedOutgoingRequests.empty) {
        throw new UnresolvedSwapRequestError('out')
      }

      const selfUnresolvedIncomingRequests = await tx.get(DBCollection.SwapRequests
        .where(Field.targetTicketId, '==', sourceTicketId)
        .where(Field.swapRequestStatus, '==', SwapRequestStatus.PENDING)
        .limit(1))
      if (!selfUnresolvedIncomingRequests.empty) {
        throw new UnresolvedSwapRequestError('in')
      }

      const targetUnresolvedOutgoingRequests = await tx.get(DBCollection.SwapRequests
        .where(Field.sourceTicketId, '==', targetTicketId)
        .where(Field.swapRequestStatus, '==', SwapRequestStatus.PENDING)
        .limit(1))
      if (!targetUnresolvedOutgoingRequests.empty) {
        const targetTicketData = targetTicketQuery.data()
        throw new UnresolvedSwapRequestError('out', targetTicketData[Field.playerName])
      }

      const targetUnresolvedIncomingRequests = await tx.get(DBCollection.SwapRequests
        .where(Field.targetTicketId, '==', targetTicketId)
        .where(Field.swapRequestStatus, '==', SwapRequestStatus.PENDING)
        .limit(1))
      if (!targetUnresolvedIncomingRequests.empty) {
        const targetTicketData = targetTicketQuery.data()
        throw new UnresolvedSwapRequestError('in', targetTicketData[Field.playerName])
      }

      const reusedRequestQuery = await tx.get(DBCollection.SwapRequests
        .where(Field.sourceTicketId, '==', sourceTicketId)
        .where(Field.swapRequestStatus, '==', SwapRequestStatus.DECLINED))
      if (!reusedRequestQuery.empty) {
        const reusedRequestDoc = reusedRequestQuery.docs[0]
        const reusedRequestData = reusedRequestDoc.data()
        if (reusedRequestData[Field.declineCount] >= MAX_ALLOWED_SWAP_REQUEST_RETRY_COUNT) {
          const targetTicketData = targetTicketQuery.data()
          throw new SwapRequestDeclineLimitError(targetTicketData[Field.ticketNumber])
        }
        tx.update(DBCollection.SwapRequests.doc(reusedRequestDoc.id), {
          [Field.swapRequestStatus]: SwapRequestStatus.PENDING,
        })
        return reusedRequestDoc.id
      } else {
        const swapRequestDoc = await createDocInTransaction(tx, DBCollection.SwapRequests, {
          [Field.cTime]: DateTime.now(),
          [Field.targetTicketId]: targetTicketId,
          [Field.sourcePlayerName]: sourceTicketData[Field.playerName],
          [Field.sourcePlayerBannerUrl]: sourceTicketData[Field.bannerUrl],
          [Field.sourceTicketId]: sourceTicketId,
          [Field.swapRequestStatus]: SwapRequestStatus.PENDING,
          [Field.declineCount]: 0,
        })
        return swapRequestDoc.id
      }

    })

    return simpleResponse<APIRequestSwapTicketHandlerReturnData>(res, swapRequestId)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
