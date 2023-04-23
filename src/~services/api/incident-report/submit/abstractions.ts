import { IncidentReportType } from '~abstractions'
import { Field } from '~constants'

export interface APISubmitIncidentReportHandlerParams {
  [Field.arcadeId]: string
  [Field.incidentReportType]: IncidentReportType
}

export type APISubmitIncidentReportHandlerReturnData = void

export type APISubmitIncidentReportReturnData = void
