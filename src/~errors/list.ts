/* eslint-disable lines-between-class-members, padded-blocks */
import { HttpStatus, isNumber, isString } from '@glyph-cat/swiss-army-knife'
import { ARCADE_LIST } from '~services/arcade-info'
import { CustomAPIError } from './classes'
import { SwapRequestStatus } from '~abstractions'
import { formatArcadeName } from '~utils/format-arcade-name'

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

/**
 * When an invalid device key is provided.
 */
export class InvalidDeviceKeyError extends CustomAPIError {
  static readonly http = HttpStatus.UNAUTHORIZED
  static readonly code = 4
  readonly message = 'Invalid device key'
}

/**
 * When an player tries to close a ticket but the device key used is different
 * from the device key used to create the ticket.
 */
export class DeviceKeyMismatchError extends CustomAPIError {
  static readonly http = HttpStatus.UNAUTHORIZED
  static readonly code = 5
  readonly message = 'Invalid device key'
}

/**
 * When user tries to set a friend code but it is already in use (associated
 * with another ticket).
 */
export class FriendCodeAlreadyInUseError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 6
  readonly message = 'Friend code already in use'
}

/**
 * When an invalid friend code is provided.
 */
export class InvalidFriendCodeError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 7
  readonly message = 'Invalid friend code'
}

/**
 * When user requests for a ticket but based on their device key, they still
 * have an one that is "in-queue".
 */
export class StillInQueueByDeviceKeyError extends CustomAPIError {
  static readonly http = HttpStatus.TOO_MANY_REQUESTS
  static readonly code = 8
  constructor(arcadeId: string) { super(getStillInQueueErrorMessage(arcadeId)) }
}

/**
 * When user requests for a ticket but based on their device key, they still
 * have an one that is "in-queue".
 */
export class StillInQueueByFriendCodeError extends CustomAPIError {
  static readonly http = HttpStatus.TOO_MANY_REQUESTS
  static readonly code = 9
  constructor(arcadeId: string) { super(getStillInQueueErrorMessage(arcadeId)) }
}

/**
 * When a ticket cannot be resolved by it's ID or number.
 */
export class TicketNotFoundError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 10
  constructor(ticketIdOrNumber: unknown) {
    if (isNumber(ticketIdOrNumber)) {
      super(`Ticket #${ticketIdOrNumber} not found`)
    } else if (isString(ticketIdOrNumber)) {
      super(`Ticket (id: ${ticketIdOrNumber}) not found`)
    } else {
      super('Ticket not found')
    }
  }
}

/**
 * When trying to perform an action involving a ticket that has been closed.
 */
export class TicketAlreadyClosedError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 11
  constructor(ticketIdOrNumber: unknown) {
    if (isNumber(ticketIdOrNumber)) {
      super(`Ticket #${ticketIdOrNumber} is already closed`)
    } else if (isString(ticketIdOrNumber)) {
      super(`Ticket (id: ${ticketIdOrNumber}) is already closed`)
    } else {
      super('Ticket is already closed')
    }
  }
}

/**
 * When the ticketId parameter is missing or invalid.
 */
export class InvalidTicketIdError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 12
  constructor(ticketId: unknown) {
    super(`Invalid ticket id: ${String(ticketId)}`)
  }
}

/**
 * When trying to transfer ticket to another player but self has no available tickets.
 */
export class NoValidTicketAvailableForTransferError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 13
  readonly message: string = 'You do not have a valid ticket to transfer'
}

/**
 * When trying to initiate swap requests but one or both of the involved players
 * are already engaged in other swap request(s).
 */
export class UnresolvedSwapRequestError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 14
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
  static readonly code = 15
  constructor(ticketNumber: number) {
    super(`You have sent too many swap requests to ticket #${ticketNumber}`)
  }
}

/**
 * When trying to act on a swap request but it cannot be resolved.
 */
export class SwapRequestNotFoundError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 16
  readonly message = 'Swap request not found'
}

/**
 * When trying to respond to or cancel a swap request that is no longer in a
 * {@link SwapRequestStatus.PENDING} status.
 */
export class SwapRequestAlreadyClosedError extends CustomAPIError {
  static readonly http = HttpStatus.NOT_FOUND
  static readonly code = 17
  constructor(swapRequestStatus: SwapRequestStatus) {
    super(`Swap request has been closed (Reason=${swapRequestStatus}`)
  }
}

/**
 * When attempting to append data to vote collection types with invalid value.
 */
export class InvalidVoteTypeError extends CustomAPIError {
  static readonly http = HttpStatus.UNPROCESSIBLE_ENTITY
  static readonly code = 18
  constructor(voteType: unknown) {
    super(`Invalid vote type <${String(voteType)}>`)
  }
}

/**
 * When attempting to flag a ticket as stale but it already has too many flags.
 */
export class ExceededMaximumStaleFlagsError extends CustomAPIError {
  static readonly http = HttpStatus.TOO_MANY_REQUESTS
  static readonly code = 19
  readonly message = 'This ticket has received the maximum amount of stale flags'
}
