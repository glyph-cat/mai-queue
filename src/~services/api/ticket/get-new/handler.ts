import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import {
  InvalidParameterError,
  StillInQueueByDeviceKeyError,
  StillInQueueByFriendCodeError,
} from '~errors'
import { ARCADE_LIST } from '~services/arcade-info'
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
import { getFormattedGuestName } from '~utils/get-formatted-guest-name'
import {
  APIGetNewTicketHandlerParams,
  APIGetNewTicketHandlerReturnData,
} from './abstractions'

export default async function APIGetNewTicketHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIGetNewTicketHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])

    const {
      [Field.arcadeId]: arcadeId,
      [Field.friendCode]: friendCode = null,
      [Field.deviceKey]: deviceKey = null,
    } = req.query as unknown as APIGetNewTicketHandlerParams

    if (!ARCADE_LIST[arcadeId]) {
      throw new InvalidParameterError(Field.arcadeId, arcadeId)
    }

    const newTicketId = await runTransaction(async (tx) => {

      const deviceInfo = await getDeviceInfoInTransaction(tx, deviceKey ? deviceKey : req)

      const existingTicketQuery = await tx.get(DBCollection.Tickets
        .where(Field.deviceKey, '==', deviceInfo.deviceKey)
        .where(Field.xTime, '==', null)
        .limit(1)
      )
      if (!existingTicketQuery.empty) {
        const existingArcadeId = existingTicketQuery.docs[0].data()[Field.arcadeId]
        throw new StillInQueueByDeviceKeyError(existingArcadeId === arcadeId ? arcadeId : null)
      }

      if (friendCode) {
        const existingFriendCodeTicketQuery = await tx.get(DBCollection.Tickets
          .where(Field.friendCode, '==', friendCode)
          .where(Field.xTime, '==', null)
          .limit(1)
        )
        if (!existingFriendCodeTicketQuery.empty) {
          const existingArcadeId = existingFriendCodeTicketQuery.docs[0].data()[Field.arcadeId]
          throw new StillInQueueByFriendCodeError(existingArcadeId === arcadeId ? arcadeId : null)
        }
        // Only check for queue purposes here, we can retrieve the banner in a
        // separate API call. Since fetching player data takes a long time, this
        // allows users to secure their tickets first.
      }

      const lastTicketDoc = await tx.get(DBCollection.Tickets
        .where(Field.arcadeId, '==', arcadeId)
        .orderBy(Field.ticketNumber, 'desc')
        .limit(1))
      let newTicketNumber = 1
      if (!lastTicketDoc.empty) {
        const lastTicketDocData = lastTicketDoc.docs[0].data()
        newTicketNumber = lastTicketDocData[Field.ticketNumber] + 1
      }

      const newTicketDoc = await createDocInTransaction(tx, DBCollection.Tickets, {
        [Field.arcadeId]: arcadeId,
        [Field.cTime]: DateTime.now(),
        [Field.ticketNumber]: newTicketNumber,
        [Field.originalTicketNumber]: newTicketNumber,
        [Field.deviceKey]: deviceInfo.deviceKey,
        [Field.bannerUrl]: null,
        [Field.playerName]: getFormattedGuestName(newTicketNumber),
        [Field.friendCode]: null,
        // NOTE: `friendCode` is not set here, it is only used to check if player
        // already has an active ticket. Friend code will be set via another API.
        [Field.xTime]: null,
        [Field.xReason]: null,
        [Field.staleFlags]: {},
      })

      return newTicketDoc.id

    })

    return simpleResponse<APIGetNewTicketHandlerReturnData>(res, newTicketId)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
