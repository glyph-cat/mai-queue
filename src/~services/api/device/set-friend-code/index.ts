/* eslint-disable import/no-deprecated */
// import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APISetFriendCodeHandlerParams,
  APISetFriendCodeHandlerReturnData,
  APISetFriendCodeReturnData,
} from './abstractions'

/**
 * @deprecated Use `APISetPlayerInfo` instead.
 */
export async function APISetFriendCode(
  params: APISetFriendCodeHandlerParams
): Promise<APISetFriendCodeReturnData> {
  await networkGet<APISetFriendCodeHandlerParams, APISetFriendCodeHandlerReturnData>(
    // NOTE: `API_ROUTE.DEVICE_SET_FRIEND_CODE` is removed for now
    '/api/device/set-friend-code',
    params,
  )
}

export * from './abstractions'
