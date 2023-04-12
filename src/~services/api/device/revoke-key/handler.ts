import { devInfo, HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { DBCollection } from '~services/firebase-admin'
import { performBasicChecks } from '~utils/backend/helpers'
import { extractDeviceKeyFromHeader } from '~utils/backend/helpers/get-device-info'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
} from '~utils/backend/response-handlers'

export default async function APIRevokeDeviceKeyHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIRevokeDeviceKeyHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.DELETE])
    const deviceKey = extractDeviceKeyFromHeader(req)
    await DBCollection.Devices.doc(deviceKey).delete()
    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
