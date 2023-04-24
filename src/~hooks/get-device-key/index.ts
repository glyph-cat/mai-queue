import { useCallback, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { APIRequestDeviceKey } from '~services/api/device/request-key'
import { ConfigSource } from '~sources/config'
import { handleClientError } from '~utils/show-error-alert'

export function useGetDeviceKey(): [() => Promise<string>, boolean] {
  const deviceKey = useRelinkValue(ConfigSource, s => s.deviceKey)
  const [isLoading, setLoadingStatus] = useState(false)
  const getDeviceKey = useCallback(async () => {
    if (deviceKey) { return deviceKey } // Early exit
    setLoadingStatus(true)
    try {
      const newDeviceKey = await APIRequestDeviceKey()
      await ConfigSource.set(s => ({ ...s, deviceKey: newDeviceKey }))
      return newDeviceKey
    } catch (e) {
      handleClientError(e)
    } finally {
      setLoadingStatus(false)
    }
  }, [deviceKey])
  return [getDeviceKey, isLoading]
}
