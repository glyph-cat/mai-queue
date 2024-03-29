import { DateTime } from 'luxon'
// import { ENV, VercelEnv } from './env'

export const PROJECT_NAME = 'mai Queue'

/**
 * The estimated time (in minutes) it takes to play one round.
 * ~Has a shortened duration in non-production builds to make it easier to test.~
 */
export const ESTIMATED_PLAY_TIME_PER_ROUND = 15 // ENV.VERCEL_ENV === VercelEnv.PRODUCTION ? 15 : 5

export const MAX_ALLOWED_SWAP_REQUEST_RETRY_COUNT = 3

export const MAX_ALLOWED_STALE_FLAG_COUNT = 5

export const MAX_PLAYER_NAME_CHAR_COUNT = 8

export const INCIDENT_REPORT_COMMENT_MAX_CHARACTERS = 200

/**
 * Each cabinet has 2 sides, this is a fact.
 *
 * We're declaring a variable to store this value so that it's self explanatory
 * instead of getting confused months later when seeing a stray `2` in the
 * middle of a pile of code and not understand what it's for.
 */
export const NUMBER_OF_SIDES_PER_CABINET = 2

export const OPEN_IN_NEW_TAB_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
}

export enum DateTimeFormat {
  USER_TIME_SHORT = 'hh:mm a',
  USER_TIME = 'hh:mm:ss a',
  LEGAL_DATE = 'd LLLL yyyy',
}

export const PRIVACY_POLICY_AND_TNC_EFFECTIVE_DATE = DateTime.fromSQL('2023-04-16').toFormat(DateTimeFormat.LEGAL_DATE)

export const CONTACT_EMAIL = 'role_chortle.0d@icloud.com'
export const MAILTO_CONTACT_EMAIL = `mailto:${CONTACT_EMAIL}`

export * from './device-recognition'
export * from './env'
export * from './field'
export * from './firestore'
export * from './labels'
export * from './styling'

