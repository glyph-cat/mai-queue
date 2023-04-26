import { ENV, VercelEnv } from '~constants'

export function f(collectionName: string): string {
  if (ENV.VERCEL_ENV === VercelEnv.PRODUCTION) {
    return `PROD_${collectionName}`
  } else if (ENV.VERCEL_ENV === VercelEnv.PREVIEW) {
    return `PREVIEW_${collectionName}`
    // } else if (ENV.IS_CI_ENVIRONMENT || process.env.NODE_ENV === 'test') {
    //   return `TEST_${collectionName}` // Unstable
  } else {
    return `INTERNAL_${collectionName}`
  }
}
