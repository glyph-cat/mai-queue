import { VoteType } from '~abstractions/vote'
import { Field } from '~constants'

export interface APIReportStaleTicketHandlerParams {
  [Field.ticketId]: string
  [Field.voteType]: VoteType
}

export type APIReportStaleTicketHandlerReturnData = void

export type APIReportStaleTicketReturnData = void
