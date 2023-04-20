/* eslint-disable import/no-deprecated */
import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { getDeviceInfoInTransaction } from '~utils/backend/helpers/get-device-info'
import { getPlayerDataAlt } from '~utils/backend/helpers/get-player-data'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
} from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'
import { getFormattedGuestName } from '~utils/get-formatted-guest-name'
import { APISetFriendCodeHandlerParams } from './abstractions'

/**
 * @deprecated
 */
export default async function APISetFriendCodeHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APISetFriendCodeHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])

    await runTransaction(async (tx) => {

      const deviceInfo = await getDeviceInfoInTransaction(tx, req)
      // if (deviceInfo.friendCode) {
      //   devError('Friend code already in use')
      //   throw new FriendCodeAlreadyInUseError()
      //   // KIV: Wtf is this...
      // }

      const {
        [Field.friendCode]: friendCode,
      } = req.query as unknown as APISetFriendCodeHandlerParams
      devInfo(`friendCode: '${friendCode}'`)

      const existingTicketQuery = await tx.get(DBCollection.Tickets
        .where(Field.deviceKey, '==', deviceInfo.deviceKey)
        .where(Field.xTime, '==', null)
        .limit(1))
      if (existingTicketQuery.empty) {
        return emptyResponse(res) // Early exit
      }

      if (friendCode) {
        devInfo('Getting player data')
        const { bannerUrl, playerName } = await getPlayerDataAlt(friendCode)
        tx.update(DBCollection.Tickets.doc(existingTicketQuery.docs[0].id), {
          [Field.friendCode]: friendCode,
          [Field.bannerUrl]: bannerUrl,
          [Field.playerName]: playerName,
        })
      } else {
        const existingTicket = await tx.get(DBCollection.Tickets.doc(existingTicketQuery.docs[0].id))
        const existingTicketData = existingTicket.data()
        tx.update(DBCollection.Tickets.doc(existingTicketQuery.docs[0].id), {
          [Field.friendCode]: null,
          [Field.bannerUrl]: null,
          [Field.playerName]: getFormattedGuestName(existingTicketData[Field.originalTicketNumber]),
        })
      }
    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
