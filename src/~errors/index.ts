/**
 * Rules of CustomAPIError:
 * - Each error should have a unique code, even if some of them have the same
 *   descriptions. This allows for traceability when trying to debug.
 * - Each error should only be used in one place to maintain traceability.
 */
export { }
export * from './classes'
export * from './list'
