import { CloseTicketReason } from '~abstractions'
import { Field } from '~constants'

export interface APICloseTicketHandlerParams {
  [Field.ticketId]: string
  [Field.xReason]: CloseTicketReason
}

export type APICloseTicketHandlerReturnData = void

export type APICloseTicketReturnData = void
