import { IS_DEBUG_ENV, isString } from '@glyph-cat/swiss-army-knife'
import axios from 'axios'
import { stringifyUrl } from 'query-string'
import { ENV, Field } from '~constants'
import { InvalidAPIKeyError, InvalidFriendCodeError } from '~errors'
import { devInfo } from '~utils/dev'

export interface PlayerDataObject {
  bannerUrl: string
  playerName: string
}

// const url = 'https://us-central1-mai-queue.cloudfunctions.net/getPlayerData'

const url = IS_DEBUG_ENV
  ? 'http://127.0.0.1:5001/mai-queue/us-central1/getPlayerData'
  : 'https://us-central1-mai-queue.cloudfunctions.net/getPlayerData'

/**
 * Alternative method to get player data based on friend code by invoking
 * Google Cloud Function.
 */
export async function getPlayerDataAlt(
  friendCode: string
): Promise<PlayerDataObject> {
  const apiUrl = stringifyUrl({ url, query: { [Field.friendCode]: friendCode } })
  devInfo('Sending GET request...')
  const res = await axios.get(apiUrl, { headers: { api_key: ENV.APP_API_KEY } })
  devInfo('Obtained response!')
  if (isString(res.data)) {
    if (res.data === 'INVALID_FRIEND_CODE') {
      throw new InvalidFriendCodeError()
    } else if (res.data === 'INVALID_API_KEY') {
      throw new InvalidAPIKeyError()
    } else {
      throw res
    }
  }
  return res.data as PlayerDataObject
}
