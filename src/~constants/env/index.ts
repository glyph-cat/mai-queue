import {
  __GIT_REPO_HOMEPAGE__,
  __SCRIPTED_APP_VERSION__,
  __SCRIPTED_GIT_COMMIT_SHA__,
} from './data.scripted'

export type NextPublicVercelEnvType = 'production' | 'preview' | 'development' | 'localhost'

const __PRIVATE_FLAG_IS_CI_ENVIRONMENT__ = parseInt(process.env.CI, 10) === 1

export const ENV = {

  // === App variables ===
  APP_VERSION: __SCRIPTED_APP_VERSION__,
  APP_API_KEY: process.env.NEXT_PUBLIC_APP_API_KEY as string,
  APP_SALT: process.env.NEXT_PUBLIC_APP_SALT as string,

  // === SPECIAL (Backend only) ===
  SEGA_ID: process.env.SEGA_ID as string,
  SEGA_PW: process.env.SEGA_PW as string,

  // === Firebase (Exposed to client) ===
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  FIREBASE_CLIENT_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY as string,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string,

  // === Firebase (Backend only) ===
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL as string,
  FIREBASE_PRIVATE_KEY: ((): string => {
    // See https://dev.to/cfofiu/how-to-store-a-long-private-key-in-vercel-s-environment-variables-46f5
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (/^\[".+"\]$/m.test(privateKey)) {
      // If is JSON syntax, parse it
      return JSON.parse(privateKey)[0]
    } else {
      // Otherwise, return as is
      return privateKey
    }
  })(),

  // === Other metadata ===
  GIT_REPO_HOMEPAGE: __GIT_REPO_HOMEPAGE__,
  GIT_COMMIT_SHA: __SCRIPTED_GIT_COMMIT_SHA__,
  /**
   * An indicator that the code is running in a Continuous Integration
   * environment. This Variable is only exposed during Build Step.
   */
  IS_CI_ENVIRONMENT: __PRIVATE_FLAG_IS_CI_ENVIRONMENT__,
  /**
   * The environment that the app is deployed an running on.
   * Possible values are:
   * - `production`  — When in Vercel environment
   * - `preview`     — When in Vercel environment
   * - `development` — When in Vercel environment
   * - `none`        — When NOT in Vercel environment (Eg: localhost)
   */
  VERCEL_ENV: (process.env.NEXT_PUBLIC_VERCEL_ENV || 'localhost') as NextPublicVercelEnvType,

} as const
