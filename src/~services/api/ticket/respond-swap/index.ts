import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APIRespondSwapRequestHandlerParams,
  APIRespondSwapRequestHandlerReturnData,
  APIRespondSwapRequestReturnData,
} from './abstractions'

export async function APIRespondSwapTicket(
  params: APIRespondSwapRequestHandlerParams
): Promise<APIRespondSwapRequestReturnData> {
  const res = await networkGet<APIRespondSwapRequestHandlerParams, APIRespondSwapRequestHandlerReturnData>(
    API_ROUTE.TICKET_RESPOND_SWAP,
    params,
  )
  return res.data
}

export * from './abstractions'
