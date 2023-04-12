import { Nullable } from '@glyph-cat/swiss-army-knife'
import { Field } from '~constants'

export interface APIGetNewTicketHandlerParams {
  [Field.arcadeId]: string
  [Field.friendCode]?: Nullable<string>
  [Field.deviceKey]?: string
}

export type APIGetNewTicketHandlerReturnData = string

export type APIGetNewTicketReturnData = string
