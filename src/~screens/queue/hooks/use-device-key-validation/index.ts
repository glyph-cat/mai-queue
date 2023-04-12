import { useRef } from '@glyph-cat/swiss-army-knife'
import { useEffect, useState } from 'react'
import { CustomDialog } from '~components/custom-dialog'
import { Field } from '~constants'
import { InvalidDeviceKeyError } from '~errors'
import { APIValidateDeviceKey } from '~services/api/device/validate-key'
import { ConfigSource } from '~sources/config'
import { clearCache } from '~unstable/clear-cache'
import { handleClientError } from '~unstable/show-error-alert'

export function useDeviceKeyValidation(deviceKey: string): boolean {
  const isInitialDeviceKeyValidationPerformed = useRef(false)
  const [isDeviceKeyValidationComplete, setDeviceKeyValidationStatus] = useState(!deviceKey)
  useEffect(() => {
    const asyncCallback = async () => {
      if (isInitialDeviceKeyValidationPerformed.current) { return }
      isInitialDeviceKeyValidationPerformed.current = true
      if (deviceKey) {
        try {
          await APIValidateDeviceKey({ [Field.deviceKey]: deviceKey })
          setDeviceKeyValidationStatus(true)
        } catch (e) {
          if (e.response?.data?.code === InvalidDeviceKeyError.code) {
            await CustomDialog.alert('Device key expired')
            await ConfigSource.set((s) => ({ ...s, deviceKey: null }))
          } else {
            await handleClientError(e, 'Unable to validate device key, please refresh the page')
            await clearCache({ noReload: true })
          }
        }
      }
    }
    asyncCallback()
  }, [deviceKey])
  return isDeviceKeyValidationComplete
}
