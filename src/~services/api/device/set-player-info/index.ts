import { IS_DEBUG_ENV, isString } from '@glyph-cat/swiss-army-knife'
import axios from 'axios'
import { stringifyUrl } from 'query-string'
import { ENV, Field } from '~constants'
import {
  FriendCodeAlreadyInUseError,
  InternalClientError,
  InvalidAPIKeyError,
  InvalidFriendCodeError,
} from '~errors'
import { API_ROUTE } from '~services/navigation'
import { devError, devInfo } from '~utils/dev'
import { networkGet } from '~utils/network'
import { APICheckFriendCode } from '../check-friend-code'
import {
  APISetPlayerInfoHandlerParams,
  APISetPlayerInfoHandlerReturnData,
  APISetPlayerInfoHandlerSpecialParams,
  APISetPlayerInfoReturnData,
} from './abstractions'

const url = IS_DEBUG_ENV
  ? 'http://127.0.0.1:5001/mai-queue/us-central1/getPlayerData'
  : 'https://us-central1-mai-queue.cloudfunctions.net/getPlayerData'

export async function APISetPlayerInfo(
  params: APISetPlayerInfoHandlerParams
): Promise<APISetPlayerInfoReturnData> {

  const { [Field.friendCode]: friendCode } = params
  const specialParams: APISetPlayerInfoHandlerSpecialParams = {
    [Field.friendCode]: friendCode,
    [Field.playerName]: null,
    [Field.bannerUrl]: null,
  }

  if (friendCode) {
    // Because fetching player data takes more than 10 seconds, we cannot do this
    // within Vercel's Cloud functions, switching to Google Cloud Functions might
    // work but it's too much work to port the variables over and breaks coherency
    // within this project at the same time. Not that the coherency is at 100%
    // now either since we need to resort to this approach... [:facepalm:]

    const isFriendCodeTaken = await APICheckFriendCode({ [Field.friendCode]: friendCode })
    if (isFriendCodeTaken) {
      throw new FriendCodeAlreadyInUseError()
    }

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
        devError(res)
        throw new InternalClientError('Z1')
      }
    }
    const {
      [Field.bannerUrl]: bannerUrl,
      [Field.playerName]: playerName,
    } = res.data
    specialParams[Field.bannerUrl] = bannerUrl
    specialParams[Field.playerName] = playerName
  }

  await networkGet<APISetPlayerInfoHandlerSpecialParams, APISetPlayerInfoHandlerReturnData>(
    API_ROUTE.DEVICE_SET_FRIEND_CODE_ALT,
    specialParams,
  )

}

export * from './abstractions'
