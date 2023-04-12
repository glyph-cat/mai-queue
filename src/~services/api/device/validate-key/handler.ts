import { devInfo, HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { Field } from '~constants'
import { InvalidDeviceKeyError } from '~errors'
import { performBasicChecks } from '~utils/backend/helpers'
import { getDeviceInfo } from '~utils/backend/helpers/get-device-info'
import {
  genericTryCatchErrorResponseHandler,
  simpleResponse,
} from '~utils/backend/response-handlers'
import {
  APIValidateDeviceKeyHandlerParams,
  APIValidateDeviceKeyHandlerReturnData,
} from './abstractions'

export default async function APIValidateDeviceKeyHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APIValidateDeviceKeyHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.GET])
    const {
      [Field.deviceKey]: deviceKey,
    } = req.query as unknown as APIValidateDeviceKeyHandlerParams
    await getDeviceInfo(deviceKey)
    return simpleResponse<APIValidateDeviceKeyHandlerReturnData>(res, true)
  } catch (e) {
    if (e instanceof InvalidDeviceKeyError) {
      return simpleResponse<APIValidateDeviceKeyHandlerReturnData>(res, false)
    } else {
      return genericTryCatchErrorResponseHandler(res, e)
    }
  }
}
