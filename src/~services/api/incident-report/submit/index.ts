import { EmptyRecord } from '~abstractions'
import { API_ROUTE } from '~services/navigation'
import { networkPost } from '~utils/network'
import {
  APISubmitIncidentReportHandlerParams,
  APISubmitIncidentReportHandlerReturnData,
  APISubmitIncidentReportReturnData,
} from './abstractions'

export async function APISubmitIncidentReport(
  params?: APISubmitIncidentReportHandlerParams
): Promise<APISubmitIncidentReportReturnData> {
  const res = await networkPost<EmptyRecord, APISubmitIncidentReportHandlerParams, APISubmitIncidentReportHandlerReturnData>(
    API_ROUTE.INCIDENT_REPORT_SUBMIT,
    {},
    params,
  )
  return res.data
}

export * from './abstractions'
