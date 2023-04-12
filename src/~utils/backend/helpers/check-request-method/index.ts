import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest } from 'next'
import { InvalidRequestMethodError } from '~errors'
import { devInfo } from '~utils/dev'

/**
 * @returns `true` if the request method matches the allowed ones.
 */
export function getRequestMethodValidity(
  req: NextApiRequest,
  allowedMethods: Array<HttpMethod>
): boolean {
  return allowedMethods.includes(req.method as HttpMethod)
}

/**
 * Throw a `CustomAPIError` if the request method does not match the allowed ones.
 */
export function checkRequestMethod(
  req: NextApiRequest,
  allowedMethods: Array<HttpMethod>
): void {
  devInfo(`Running: ${checkRequestMethod.name}`)
  const isMethodValid = getRequestMethodValidity(req, allowedMethods)
  if (!isMethodValid) {
    throw new InvalidRequestMethodError()
  }
}
