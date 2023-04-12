import { Field } from '~constants'

export interface APITransferTicketHandlerParams {
  [Field.arcadeId]: string
  [Field.deviceKey]: string
}

export type APITransferTicketHandlerReturnData = string

export type APITransferTicketReturnData = string
