import { Field } from '~constants'

export interface APISetPlayerInfoHandlerParams {
  [Field.friendCode]: string
}

export interface APISetPlayerInfoHandlerSpecialParams {
  [Field.friendCode]: string
  [Field.playerName]: string
  [Field.bannerUrl]: string
}

export type APISetPlayerInfoHandlerReturnData = void

export type APISetPlayerInfoReturnData = void
