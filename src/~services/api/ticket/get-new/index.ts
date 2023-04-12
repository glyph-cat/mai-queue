import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APIGetNewTicketHandlerParams,
  APIGetNewTicketHandlerReturnData,
  APIGetNewTicketReturnData,
} from './abstractions'

export async function APIGetNewTicket(
  params: APIGetNewTicketHandlerParams
): Promise<APIGetNewTicketReturnData> {
  const res = await networkGet<APIGetNewTicketHandlerParams, APIGetNewTicketHandlerReturnData>(
    API_ROUTE.TICKET_GET_NEW,
    params,
  )
  return res.data
}

export * from './abstractions'
