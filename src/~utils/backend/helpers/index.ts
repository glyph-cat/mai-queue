import { HttpMethod, IS_DEBUG_ENV } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest } from 'next'
import { devInfo } from '~utils/dev'
import { checkApiKey } from './check-api-key'
import { checkRequestMethod } from './check-request-method'

export function performBasicChecks(
  req: NextApiRequest,
  allowedMethods: Array<HttpMethod>
): void {
  devInfo('Performing basic checks...')
  if (IS_DEBUG_ENV) {
    if (allowedMethods.length <= 0) {
      throw new Error('Expected at least 1 `allowedMethods` but received none')
    }
  }
  checkRequestMethod(req, allowedMethods)
  checkApiKey(req)
}
