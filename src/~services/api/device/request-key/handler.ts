import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-admin'
import { performBasicChecks } from '~utils/backend/helpers'
import {
  genericTryCatchErrorResponseHandler,
  simpleResponse,
} from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'
import { APIRequestDeviceKeyHandlerReturnData } from './abstractions'

export default async function APIRequestDeviceKeyHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIRequestDeviceKeyHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])
    const doc = await DBCollection.Devices.add({
      [Field.cTime]: DateTime.now(),
      [Field.friendCode]: null,
    })
    const newDeviceKey = doc.id
    return simpleResponse<APIRequestDeviceKeyHandlerReturnData>(res, newDeviceKey)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
