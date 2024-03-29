import { HttpStatus } from '@glyph-cat/swiss-army-knife'
import { NextApiResponse } from 'next'
import { CustomAPIError } from '~errors'
import { devError, devInfo } from '~utils/dev'

export function jsonResponse<D>(
  res: NextApiResponse,
  jsonData: D
): void {
  devInfo('Handler completed by sending a JSON response')
  res.status(HttpStatus.OK).json(jsonData)
}

export function simpleResponse<T>(res: NextApiResponse, value: T): void {
  devInfo(`Handler completed by sending a ${typeof value} response`)
  res.status(HttpStatus.OK).send(value)
}

export function emptyResponse(res: NextApiResponse): void {
  devInfo('Handler completed by sending an empty response')
  res.status(HttpStatus.NO_CONTENT).end()
}

function customErrorResponse(
  res: NextApiResponse,
  error: CustomAPIError
): void {
  devError('Handler failed with the following error:\n', error)
  res.status(error.http).json({
    code: error.code,
    message: error.message,
  })
}

function internalServerErrorResponse(res: NextApiResponse, error: Error): void {
  devInfo('Handler failed with an internal error')
  res.status(HttpStatus.INTERNAL_ERROR).send(error)
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
