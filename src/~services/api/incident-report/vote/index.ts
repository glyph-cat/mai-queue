import { API_ROUTE } from '~services/navigation'
import { networkGet } from '~utils/network'
import {
  APIVoteOnIncidentReportHandlerParams,
  APIVoteOnIncidentReportHandlerReturnData,
  APIVoteOnIncidentReportReturnData,
} from './abstractions'

export async function APISubmitIncidentReport(
  params?: APIVoteOnIncidentReportHandlerParams
): Promise<APIVoteOnIncidentReportReturnData> {
  const res = await networkGet<APIVoteOnIncidentReportHandlerParams, APIVoteOnIncidentReportHandlerReturnData>(
    API_ROUTE.INCIDENT_REPORT_VOTE,
    params,
  )
  return res.data
}

export * from './abstractions'
