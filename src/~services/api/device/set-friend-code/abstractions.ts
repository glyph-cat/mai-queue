import { Nullable } from '@glyph-cat/swiss-army-knife'
import { Field } from '~constants'

export interface APISetFriendCodeHandlerParams {
  [Field.friendCode]: Nullable<string>
}

export type APISetFriendCodeHandlerReturnData = void

export type APISetFriendCodeReturnData = void
