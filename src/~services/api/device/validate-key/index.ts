import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APIValidateDeviceKeyHandlerParams,
  APIValidateDeviceKeyHandlerReturnData,
  APIValidateDeviceKeyReturnData,
} from './abstractions'

/**
 * @returns `true` if the device key is valid.
 */
export async function APIValidateDeviceKey(
  data: APIValidateDeviceKeyHandlerParams
): Promise<APIValidateDeviceKeyReturnData> {
  const res = await networkGet<APIValidateDeviceKeyHandlerParams, APIValidateDeviceKeyHandlerReturnData>(
    API_ROUTE.DEVICE_VALIDATE_KEY,
    data,
  )
  return !!res.data
}

export * from './abstractions'
