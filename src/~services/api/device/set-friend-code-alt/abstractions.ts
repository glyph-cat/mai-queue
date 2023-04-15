import { Field } from '~constants'

export interface APISetFriendCodeAltHandlerParams {
  [Field.friendCode]: string
}

export interface APISetFriendCodeAltHandlerSpecialParams {
  [Field.friendCode]: string
  [Field.playerName]: string
  [Field.bannerUrl]: string
}

export type APISetFriendCodeAltHandlerReturnData = void

export type APISetFriendCodeAltReturnData = void
