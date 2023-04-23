import { Nullable } from '@glyph-cat/swiss-army-knife'
import { Field } from '~constants'

/**
 * @deprecated Use `APISetPlayerInfo` instead.
 */
export interface APISetFriendCodeHandlerParams {
  [Field.friendCode]: Nullable<string>
}

/**
 * @deprecated Use `APISetPlayerInfo` instead.
 */
export type APISetFriendCodeHandlerReturnData = void

/**
 * @deprecated Use `APISetPlayerInfo` instead.
 */
export type APISetFriendCodeReturnData = void
