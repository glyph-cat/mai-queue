import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APICloseTicketHandlerParams,
  APICloseTicketHandlerReturnData,
  APICloseTicketReturnData,
} from './abstractions'

export async function APICloseTicket(
  params: APICloseTicketHandlerParams
): Promise<APICloseTicketReturnData> {
  const res = await networkGet<APICloseTicketHandlerParams, APICloseTicketHandlerReturnData>(
    API_ROUTE.TICKET_CLOSE,
    params,
  )
  return res.data
}

export * from './abstractions'
