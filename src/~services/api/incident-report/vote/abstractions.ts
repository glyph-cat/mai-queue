import { VoteType } from '~abstractions/vote'
import { Field } from '~constants'

export interface APIVoteOnIncidentReportHandlerParams {
  [Field.incidentReportId]: string
  [Field.voteType]: VoteType
}

export type APIVoteOnIncidentReportHandlerReturnData = void

export type APIVoteOnIncidentReportReturnData = void
