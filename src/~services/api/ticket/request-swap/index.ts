import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APIRequestSwapTicketHandlerParams,
  APIRequestSwapTicketHandlerReturnData,
  APIRequestSwapTicketReturnData,
} from './abstractions'

export async function APIRequestSwapTicket(
  params: APIRequestSwapTicketHandlerParams
): Promise<APIRequestSwapTicketReturnData> {
  const res = await networkGet<APIRequestSwapTicketHandlerParams, APIRequestSwapTicketHandlerReturnData>(
    API_ROUTE.TICKET_REQUEST_SWAP,
    params,
  )
  return res.data
}

export * from './abstractions'
