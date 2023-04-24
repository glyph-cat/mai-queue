import { HttpStatus } from '@glyph-cat/swiss-army-knife'

export class ClientError extends Error { }

export class ClientCollectionWriteError extends ClientError {

  constructor(collectionName: string) {
    super(`Client cannot write to the '${collectionName}' collection`)
  }

}

export class InternalClientError extends ClientError {

  constructor(errorCodeAndOrParams: string) {
    super(errorCodeAndOrParams)
  }

}

/**
 * @see https://stackoverflow.com/a/29244254/5810737
 */
export class CustomAPIError extends Error {

  static readonly http: HttpStatus
  static readonly code: number

  constructor(readonly message: string = '<CustomAPIError>') {
    super(message)
  }

  get http(): HttpStatus {
    return (this.constructor as typeof CustomAPIError).http
  }

  get code(): number {
    return (this.constructor as typeof CustomAPIError).code
  }

}
