import { IncidentReportStatus, IncidentReportType } from '~abstractions'
import { Field } from '~constants'

export interface APISubmitIncidentReportHandlerParams {
  [Field.arcadeId]: string
  [Field.incidentReportType]: IncidentReportType
  [Field.incidentReportStatus]: IncidentReportStatus
}

export type APISubmitIncidentReportHandlerReturnData = void

export type APISubmitIncidentReportReturnData = void
