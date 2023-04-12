import { NextApiRequest } from 'next'
import { ENV } from '~constants'
import { InvalidAPIKeyError } from '~errors'
import { devInfo } from '~utils/dev'

/**
 * @returns `true` if API key is valid, otherwise `false`.
 * @public
 */
export function getApiKeyValidity(req: NextApiRequest): boolean {
  return req.headers.api_key === ENV.APP_API_KEY
}

/**
 * Throws a `CustomAPIError` if API key is invalid.
 * @public
 */
export function checkApiKey(req: NextApiRequest): void {
  devInfo(`Running: ${checkApiKey.name}`)
  const isAPIKeyValid = getApiKeyValidity(req)
  if (!isAPIKeyValid) {
    throw new InvalidAPIKeyError()
  }
}
