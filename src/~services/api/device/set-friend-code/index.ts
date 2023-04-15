/* eslint-disable import/no-deprecated */
// import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APISetFriendCodeHandlerParams,
  APISetFriendCodeHandlerReturnData,
  APISetFriendCodeReturnData,
} from './abstractions'

/**
 * @deprecated For the time being, use `APISetFriendCodeAlt`.
 */
export async function APISetFriendCode(
  params: APISetFriendCodeHandlerParams
): Promise<APISetFriendCodeReturnData> {
  await networkGet<APISetFriendCodeHandlerParams, APISetFriendCodeHandlerReturnData>(
    // KIV: `API_ROUTE.DEVICE_SET_FRIEND_CODE` is removed for now
    '/api/device/set-friend-code-alt',
    params,
  )
}

export * from './abstractions'
