import { API_ROUTE } from '~services/navigation'
import { networkDelete } from '~utils/network'
import {
  APICancelSwapRequestHandlerParams,
  APICancelSwapRequestHandlerReturnData,
  APICancelSwapRequestReturnData,
} from './abstractions'

export async function APICancelSwapTicket(
  params: APICancelSwapRequestHandlerParams
): Promise<APICancelSwapRequestReturnData> {
  const res = await networkDelete<APICancelSwapRequestHandlerParams, APICancelSwapRequestHandlerReturnData>(
    API_ROUTE.TICKET_CANCEL_SWAP,
    params,
  )
  return res.data
}

export * from './abstractions'
