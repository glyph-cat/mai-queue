import { VoteType } from '~abstractions/vote'
import { Field } from '~constants'

export interface APIVoteOnIncidentReportHandlerParams {
  /**
   * Incident report ID.
   */
  [Field.id]: string
  [Field.voteType]: VoteType
}

export type APIVoteOnIncidentReportHandlerReturnData = void

export type APIVoteOnIncidentReportReturnData = void
