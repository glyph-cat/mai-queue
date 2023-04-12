import { ENV } from '~constants'

export function f(collectionName: string): string {
  if (ENV.VERCEL_ENV === 'production') {
    return `PROD_${collectionName}`
  } else if (ENV.VERCEL_ENV === 'preview') {
    return `PREVIEW_${collectionName}`
  } else {
    return `INTERNAL_${collectionName}`
  }
}
