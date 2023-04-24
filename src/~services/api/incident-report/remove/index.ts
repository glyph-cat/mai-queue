import { API_ROUTE } from '~services/navigation'
import { networkDelete } from '~utils/network'
import {
  APIRemoveIncidentReportHandlerParams,
  APIRemoveIncidentReportHandlerReturnData,
  APIRemoveIncidentReportReturnData,
} from './abstractions'

export async function APIRemoveIncidentReport(
  params: APIRemoveIncidentReportHandlerParams
): Promise<APIRemoveIncidentReportReturnData> {
  const res = await networkDelete<APIRemoveIncidentReportHandlerParams, APIRemoveIncidentReportHandlerReturnData>(
    API_ROUTE.INCIDENT_REPORT_REMOVE,
    params,
  )
  return res.data
}

export * from './abstractions'
