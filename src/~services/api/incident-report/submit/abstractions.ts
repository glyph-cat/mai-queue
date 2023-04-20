import { Nullable } from '@glyph-cat/swiss-army-knife'
import { IncidentReportType } from '~abstractions'
import { VoteType } from '~abstractions/vote'
import { Field } from '~constants'

export interface APISubmitIncidentReportHandlerParams {
  [Field.arcadeId]: string
  [Field.incidentReportType]: IncidentReportType
  [Field.incidentReportComment]: Nullable<string>
  [Field.voteType]: VoteType
}

export type APISubmitIncidentReportHandlerReturnData = void

export type APISubmitIncidentReportReturnData = void
