import { devError, devInfo, HttpStatus } from '@glyph-cat/swiss-army-knife'
import { NextApiResponse } from 'next'
import { CustomAPIError } from '~errors'

export function jsonResponse<D>(
  res: NextApiResponse,
  jsonData: D
): void {
  devInfo('Handler completed by sending a JSON response')
  return res.status(HttpStatus.OK).json(jsonData)
}

export function simpleResponse<T>(res: NextApiResponse, value: T): void {
  devInfo(`Handler completed by sending a ${typeof value} response`)
  return res.status(HttpStatus.OK).send(value)
}

export function emptyResponse(res: NextApiResponse): void {
  devInfo('Handler completed by sending an empty response')
  return res.status(HttpStatus.NO_CONTENT).send(null)
}

function customErrorResponse(
  res: NextApiResponse,
  error: CustomAPIError
): void {
  // eslint-disable-next-line no-console
  console.error('Handler failed with the following error:\n', error)
  return res.status(error.http).json({
    code: error.code,
    message: error.message,
  })
}

function internalServerErrorResponse(res: NextApiResponse, error: Error): void {
  devInfo('Handler failed with an internal error')
  return res.status(HttpStatus.INTERNAL_ERROR).send(error)
}

export function genericTryCatchErrorResponseHandler(
  res: NextApiResponse,
  error: CustomAPIError
): void {
  if (error instanceof CustomAPIError) {
    return customErrorResponse(res, error)
  } else {
    devError(error)
    return internalServerErrorResponse(res, error)
  }
}
