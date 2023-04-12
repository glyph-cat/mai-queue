import { devInfo, HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { VoteType } from '~abstractions/vote'
import { Field, MAX_ALLOWED_STALE_FLAG_COUNT } from '~constants'
import {
  ExceededMaximumStaleFlagsError,
  InvalidTicketIdError,
  InvalidVoteTypeError,
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
import { APIReportStaleTicketHandlerParams } from './abstractions'
import { firestore } from 'firebase-admin'
import { CloseTicketReason } from '~abstractions'

export default async function APIReportStaleTicketHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIReportStaleTicketHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.POST])

    await runTransaction(async (tx) => {

      const deviceInfo = await getDeviceInfoInTransaction(tx, req)

      const {
        [Field.ticketId]: targetTicketId,
        [Field.voteType]: voteType,
      } = req.body as unknown as APIReportStaleTicketHandlerParams

      if (!targetTicketId) {
        throw new InvalidTicketIdError(targetTicketId)
      }

      const ticketDocRef = DBCollection.Tickets.doc(targetTicketId)
      const ticketQuery = await tx.get(ticketDocRef)
      if (!ticketQuery.exists) {
        throw new TicketNotFoundError(targetTicketId)
      }

      const ticketData = ticketQuery.data()
      if (ticketData[Field.xTime]) {
        throw new TicketAlreadyClosedError(ticketData[Field.ticketNumber])
      }
      if (Object.keys(ticketData[Field.staleFlags]).length) {
        throw new ExceededMaximumStaleFlagsError()
      }

      const staleFlags = ticketData[Field.staleFlags]
      if (voteType === VoteType.UPVOTE) {
        const newStaleFlags = { ...staleFlags, [deviceInfo.deviceKey]: voteType }
        tx.update(ticketDocRef, { [Field.staleFlags]: newStaleFlags })
        if (Object.keys(newStaleFlags).length > MAX_ALLOWED_STALE_FLAG_COUNT) {
          tx.update(ticketDocRef, {
            [Field.xTime]: firestore.Timestamp.now(),
            [Field.xReason]: CloseTicketReason.STALE,
          })
        }
      } else if (voteType === VoteType.WITHDRAW) {
        const {
          [deviceInfo.deviceKey]: _deviceKeyToRemove,
          ...remainingStaleFlags
        } = staleFlags
        tx.update(ticketDocRef, { [Field.staleFlags]: remainingStaleFlags })
      } else {
        throw new InvalidVoteTypeError(voteType)
      }

    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
