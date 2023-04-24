/* eslint-disable lines-between-class-members, padded-blocks */
import { HttpStatus, isNumber, isString } from '@glyph-cat/swiss-army-knife'
import { SwapRequestStatus } from '~abstractions'
import { Field } from '~constants'
import { ARCADE_LIST } from '~services/arcade-info/list'
import { formatArcadeName } from '~utils/format-arcade-name'
import { CustomAPIError } from './classes'

function getStillInQueueErrorMessage(arcadeId: string): string {
  if (isString(arcadeId)) {
    const arcade = ARCADE_LIST[Number(arcadeId)]
    return `You already have a ticket in ${formatArcadeName(arcade)}`
  } else {
    return 'You already have a ticket'
  }
}

/**
 * Use this to compose a custom message for niche internal errors.
 */
export class InternalAPIError extends CustomAPIError {
  static readonly http = HttpStatus.INTERNAL_ERROR
  static readonly code = 1
}

/**
 * When API is called with invalid API key or none at all.
 */
export class InvalidAPIKeyError extends CustomAPIError {
  static readonly http = HttpStatus.FORBIDDEN
  static readonly code = 2
  readonly message = 'Invalid API key'
}

/**
 * When API is called with incorrect HTTP method.
 */
export class InvalidRequestMethodError extends CustomAPIError {
  static readonly http = HttpStatus.METHOD_NOT_ALLOWED
  static readonly code = 3
  readonly message = 'Invalid request method'
}

export class InvalidParameterError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 4
  constructor(name: Field, value?: unknown) {
    if (value) {
      super(`Invalid parameter "${Field[name]}" <${String(value)}> of type ${typeof value}`)
    } else {
      super(`Invalid parameter "${Field[name]}"`)
    }
  }
}

export class MissingParameterError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 5
  constructor(name: Field) {
    super(`Missing parameter "${Field[name]}"`)
  }
}

/**
 * When an invalid device key is provided.
 */
export class InvalidDeviceKeyError extends CustomAPIError {
  static readonly http = HttpStatus.UNAUTHORIZED
  static readonly code = 6
  readonly message = 'Invalid device key'
}

/**
 * When an player tries to close a ticket but the device key used is different
 * from the device key used to create the ticket.
 */
export class DeviceKeyMismatchError extends CustomAPIError {
  static readonly http = HttpStatus.UNAUTHORIZED
  static readonly code = 7
  readonly message = 'Invalid device key'
}

/**
 * When user tries to set a friend code but it is already in use (associated
 * with another ticket).
 */
export class FriendCodeAlreadyInUseError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 8
  readonly message = 'Friend code already in use'
}

/**
 * When an invalid friend code is provided.
 */
export class InvalidFriendCodeError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 9
  readonly message = 'Invalid friend code'
}

/**
 * When user requests for a ticket but based on their device key, they still
 * have an one that is "in-queue".
 */
export class StillInQueueByDeviceKeyError extends CustomAPIError {
  static readonly http = HttpStatus.TOO_MANY_REQUESTS
  static readonly code = 10
  constructor(arcadeId: string) { super(getStillInQueueErrorMessage(arcadeId)) }
}

/**
 * When user requests for a ticket but based on their device key, they still
 * have an one that is "in-queue".
 */
export class StillInQueueByFriendCodeError extends CustomAPIError {
  static readonly http = HttpStatus.TOO_MANY_REQUESTS
  static readonly code = 11
  constructor(arcadeId: string) { super(getStillInQueueErrorMessage(arcadeId)) }
}

/**
 * When a ticket cannot be resolved by it's ID or number.
 */
export class TicketNotFoundError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 12
  constructor(ticketIdOrNumber: unknown, descriptor?: string) {
    const TICKET = descriptor ? `${descriptor} t` : 'T' + 'icket'
    if (isNumber(ticketIdOrNumber)) {
      super(`${TICKET} #${ticketIdOrNumber} not found`)
    } else if (isString(ticketIdOrNumber)) {
      super(`${TICKET} (id: ${ticketIdOrNumber}) not found`)
    } else {
      super(`${TICKET} not found`)
    }
  }
}

/**
 * When trying to perform an action involving a ticket that has been closed.
 */
export class TicketAlreadyClosedError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 13
  constructor(ticketIdOrNumber: unknown, descriptor?: string) {
    const TICKET = descriptor ? `${descriptor} t` : 'T' + 'icket'
    if (isNumber(ticketIdOrNumber)) {
      super(`${TICKET} #${ticketIdOrNumber} is already closed`)
    } else if (isString(ticketIdOrNumber)) {
      super(`${TICKET} (id: ${ticketIdOrNumber}) is already closed`)
    } else {
      super(`${TICKET} is already closed`)
    }
  }
}

/**
 * When the ticketId parameter is missing or invalid.
 */
export class InvalidTicketIdError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 14
  constructor(ticketId: unknown, descriptor?: string) {
    super(`Invalid ${descriptor ? `${descriptor} ` : ''} ticket id: ${String(ticketId)}`)
  }
}

/**
 * When trying to transfer ticket to another player but self has no available tickets.
 */
export class NoValidTicketAvailableForTransferError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 15
  readonly message: string = 'You do not have a valid ticket to transfer'
}

/**
 * When trying to initiate swap requests but one or both of the involved players
 * are already engaged in other swap request(s).
 */
export class UnresolvedSwapRequestError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 16
  constructor(
    direction: 'in' | 'out',
    playerName?: string,
  ) {
    if (isString(playerName)) {
      super([
        `${playerName} has an unresolved`,
        direction === 'in' ? 'incoming' : 'outgoing',
        ' swap request',
      ].join(' '))
    } else {
      super([
        'You have an unresolved',
        direction === 'in' ? 'incoming' : 'outgoing',
        ' swap request',
      ].join(' '))
    }
  }
}

/**
 * When a swap request has been declined for more than a set threshold.
 */
export class SwapRequestDeclineLimitError extends CustomAPIError {
  static readonly http = HttpStatus.TOO_MANY_REQUESTS
  static readonly code = 17
  constructor(ticketNumber: number) {
    super(`You have sent too many swap requests to ticket #${ticketNumber}`)
  }
}

/**
 * When trying to act on a swap request but it cannot be resolved.
 */
export class SwapRequestNotFoundError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 18
  readonly message = 'Swap request not found'
}

/**
 * When trying to respond to or cancel a swap request that is no longer in a
 * {@link SwapRequestStatus.PENDING} status.
 */
export class SwapRequestAlreadyClosedError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 19
  constructor(swapRequestStatus: SwapRequestStatus) {
    super(`Swap request has been closed (Reason=${swapRequestStatus}`)
  }
}

/**
 * When attempting to flag a ticket as stale but it already has too many flags.
 */
export class ExceededMaximumStaleFlagsError extends CustomAPIError {
  static readonly http = HttpStatus.TOO_MANY_REQUESTS
  static readonly code = 20
  readonly message = 'This ticket has received the maximum amount of stale flags'
}

export class IncidentReportNotFoundError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 21
  constructor(incidentReportId?: string) {
    super(incidentReportId
      ? `Incident report (id: ${incidentReportId}) not found`
      : 'Incident report not found'
    )
  }
}

export class PlayerNameTooLongError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 22
  readonly message = 'Player name too long'
}
