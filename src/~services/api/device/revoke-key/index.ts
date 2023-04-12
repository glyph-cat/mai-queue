import { API_ROUTE } from '~services/navigation'
import { networkDelete } from '~utils/network'
import {
  APIRevokeDeviceKeyHandlerParams,
  APIRevokeDeviceKeyHandlerReturnData,
  APIRevokeDeviceKeyReturnData,
} from './abstractions'

export async function APIRevokeDeviceKey(): Promise<APIRevokeDeviceKeyReturnData> {
  const res = await networkDelete<APIRevokeDeviceKeyHandlerParams, APIRevokeDeviceKeyHandlerReturnData>(
    API_ROUTE.DEVICE_REVOKE_KEY,
  )
  return res.data
}

export * from './abstractions'
