/**
 * Compare object refernce with this value to check if a dialog has been
 * cancelled.
 */
export const CUSTOM_DIALOG_CANCEL_VALUE: Record<never, never> = {} as const

export type CustomDialogCancellableValue<V> = V | typeof CUSTOM_DIALOG_CANCEL_VALUE
