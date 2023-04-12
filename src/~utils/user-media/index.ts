import { CustomDialog } from '~components/custom-dialog'

/**
 * Checks if the User Media API is supported by the browser.
 */
export function hasUserMedia(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

let isCheckCompleteForAlertOnlyOnce = false
export function hasUserMediaWithAlertIfUnavailable(): boolean {
  const isUserMediaSupported = hasUserMedia()
  if (!isCheckCompleteForAlertOnlyOnce) {
    isCheckCompleteForAlertOnlyOnce = true
    if (!isUserMediaSupported) {
      CustomDialog.alert(
        'Unable to access camera because the User Media API is unavailable ' +
        'on this device.'
      )
    }
  }
  return isUserMediaSupported
}
