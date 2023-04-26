import { ENV, VercelEnv } from '~constants'

/**
 * @public
 */
export type DevLogType = 'info' | 'warn' | 'error'

/**
 * A wrapper around console methods. However, they will be omitted during
 * minification for production, saving a few bytes and slightly improving
 * performance.
 * @internal
 */
export function devPrint(
  type: DevLogType,
  ...message: unknown[]
): void {
  if (ENV.VERCEL_ENV !== VercelEnv.PRODUCTION) {
    // eslint-disable-next-line no-console
    console[type](...message)
  }
}

/**
 * Equivalent of `console.info`.
 * It is okay to use `console.log` during development, but remember to remove
 * them after debugging is complete.
 * @public
 */
export function devInfo(...message: unknown[]): void {
  devPrint('info', ...message)
}

/**
 * Equivalent of `console.warn`.
 * @public
 */
export function devWarn(...message: unknown[]): void {
  devPrint('warn', ...message)
}

/**
 * Equivalent of `console.error`.
 * @public
 */
export function devError(...message: unknown[]): void {
  devPrint('error', ...message)
}
