import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field, MAX_PLAYER_NAME_CHAR_COUNT } from '~constants'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { getDeviceInfo } from '~utils/backend/helpers/get-device-info'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
} from '~utils/backend/response-handlers'
import { devInfo, devWarn } from '~utils/dev'
import { getFormattedGuestName } from '~utils/get-formatted-guest-name'
import { APISetPlayerInfoHandlerSpecialParams } from './abstractions'
import { PlayerNameTooLongError } from '~errors'

export default async function APISetPlayerInfoHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APISetPlayerInfoHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])

    const deviceInfo = await getDeviceInfo(req)

    const {
      [Field.friendCode]: friendCode,
      [Field.playerName]: playerName,
      [Field.bannerUrl]: bannerUrl,
    } = req.query as unknown as APISetPlayerInfoHandlerSpecialParams

    if (playerName && playerName.length > MAX_PLAYER_NAME_CHAR_COUNT) {
      throw new PlayerNameTooLongError()
    }

    await runTransaction(async (tx) => {

      const existingTicketQuery = await tx.get(DBCollection.Tickets
        .where(Field.deviceKey, '==', deviceInfo.deviceKey)
        .where(Field.xTime, '==', null)
        .limit(1))
      if (existingTicketQuery.empty) {
        devWarn('This is not supposed to happen, if there\'s no ticket, then the client should not be invoking this API')
        return emptyResponse(res) // Early exit
      }

      if (friendCode) {
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
