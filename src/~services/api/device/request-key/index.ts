import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APIRequestDeviceKeyHandlerParams,
  APIRequestDeviceKeyHandlerReturnData,
  APIRequestDeviceKeyReturnData,
} from './abstractions'

export async function APIRequestDeviceKey(
  params?: APIRequestDeviceKeyHandlerParams
): Promise<APIRequestDeviceKeyReturnData> {
  const res = await networkGet<APIRequestDeviceKeyHandlerParams, APIRequestDeviceKeyHandlerReturnData>(
    API_ROUTE.DEVICE_REQUEST_KEY,
    params,
  )
  return res.data
}

export * from './abstractions'
