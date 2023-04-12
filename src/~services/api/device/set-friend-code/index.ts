import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APISetFriendCodeHandlerParams,
  APISetFriendCodeHandlerReturnData,
  APISetFriendCodeReturnData,
} from './abstractions'

export async function APISetFriendCode(
  params: APISetFriendCodeHandlerParams
): Promise<APISetFriendCodeReturnData> {
  await networkGet<APISetFriendCodeHandlerParams, APISetFriendCodeHandlerReturnData>(
    API_ROUTE.DEVICE_SET_FRIEND_CODE,
    params,
  )
}

export * from './abstractions'
