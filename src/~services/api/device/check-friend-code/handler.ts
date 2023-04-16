import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { getDeviceInfo } from '~utils/backend/helpers/get-device-info'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
  simpleResponse,
} from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'
import { APICheckFriendCodeHandlerParams } from './abstractions'

export default async function APICheckFriendCodeHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APICheckFriendCodeHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])
    await getDeviceInfo(req)
    await runTransaction(async (tx) => {

      const {
        [Field.friendCode]: friendCode,
      } = req.query as unknown as APICheckFriendCodeHandlerParams

      if (!friendCode) {
        return simpleResponse<boolean>(res, false)
      }

      const existingTicketQuery = await tx.get(DBCollection.Tickets
        .where(Field.friendCode, '==', friendCode)
        .where(Field.xTime, '==', null)
        .limit(1))
      return simpleResponse<boolean>(res, !existingTicketQuery.empty)

    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
