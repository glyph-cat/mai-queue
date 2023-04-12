import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APITransferTicketHandlerParams,
  APITransferTicketHandlerReturnData,
  APITransferTicketReturnData,
} from './abstractions'

export async function APITransferTicket(
  params: APITransferTicketHandlerParams
): Promise<APITransferTicketReturnData> {
  const res = await networkGet<APITransferTicketHandlerParams, APITransferTicketHandlerReturnData>(
    API_ROUTE.TICKET_TRANSFER,
    params,
  )
  return res.data
}

export * from './abstractions'
