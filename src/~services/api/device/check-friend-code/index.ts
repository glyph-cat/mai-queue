import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APICheckFriendCodeHandlerParams,
  APICheckFriendCodeHandlerReturnData,
  APICheckFriendCodeReturnData,
} from './abstractions'

export async function APICheckFriendCode(
  params: APICheckFriendCodeHandlerParams
): Promise<APICheckFriendCodeReturnData> {
  const res = await networkGet<APICheckFriendCodeHandlerParams, APICheckFriendCodeHandlerReturnData>(
    API_ROUTE.DEVICE_CHECK_FRIEND_CODE,
    params,
  )
  return res.data
}

export * from './abstractions'
