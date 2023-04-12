import { API_ROUTE } from '~services/navigation'
import { networkPost } from '~utils/network'
import {
  APIReportStaleTicketHandlerParams,
  APIReportStaleTicketHandlerReturnData,
  APIReportStaleTicketReturnData,
} from './abstractions'

export async function APIReportStaleTicket(
  params: APIReportStaleTicketHandlerParams
): Promise<APIReportStaleTicketReturnData> {
  const res = await networkPost<Record<string, never>, APIReportStaleTicketHandlerParams, APIReportStaleTicketHandlerReturnData>(
    API_ROUTE.TICKET_REPORT_STALE,
    {},
    params,
  )
  return res.data
}

export * from './abstractions'
