import { devInfo, HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import { NoValidTicketAvailableForTransferError } from '~errors'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { getDeviceInfoInTransaction } from '~utils/backend/helpers/get-device-info'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
} from '~utils/backend/response-handlers'
import { getFormattedGuestName } from '~utils/get-formatted-guest-name'
import { APITransferTicketHandlerParams } from './abstractions'

export default async function APITransferTicketHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APITransferTicketHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])

    await runTransaction(async (tx) => {

      const {
        [Field.arcadeId]: arcadeId,
        [Field.deviceKey]: deviceKey = null,
      } = req.query as unknown as APITransferTicketHandlerParams

      // NOTE: arcadeId is included as a safeguard.

      const deviceInfo = await getDeviceInfoInTransaction(tx, req)

      const ticketQuery = await tx.get(DBCollection.Tickets
        .where(Field.deviceKey, '==', deviceInfo.deviceKey)
        .where(Field.arcadeId, '==', arcadeId)
        .where(Field.xTime, '==', null)
        .limit(1)
      )
      if (ticketQuery.empty) {
        throw new NoValidTicketAvailableForTransferError()
      }

      const ticketDoc = ticketQuery.docs[0]
      const ticketData = ticketDoc.data()
      tx.update(ticketQuery.docs[0].ref, {
        [Field.deviceKey]: deviceKey,
        [Field.playerName]: getFormattedGuestName(ticketData[Field.originalTicketNumber]),
        [Field.friendCode]: null,
        [Field.bannerUrl]: null,
        [Field.staleFlags]: {},
      })

    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
