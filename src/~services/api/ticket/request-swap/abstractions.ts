import { Field } from '~constants'

export interface APIRequestSwapTicketHandlerParams {
  [Field.sourceTicketId]: string
  [Field.targetTicketId]: string
}

export type APIRequestSwapTicketHandlerReturnData = string

export type APIRequestSwapTicketReturnData = string
