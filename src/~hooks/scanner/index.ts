import { useLayoutEffect, useRef } from '@glyph-cat/swiss-army-knife'
import {
  BrowserMultiFormatReader,
  ChecksumException as ZXingChecksumException,
  FormatException as ZXingFormatException,
  NotFoundException as ZXingNotFoundException,
} from '@zxing/library'
import { MutableRefObject } from 'react'
import { RelinkSource } from 'react-relink'
import { IS_HUAWEI_DEVICE } from '~constants'
import { devError, devInfo, devWarn } from '~utils/dev'
import { hasUserMediaWithAlertIfUnavailable } from '~utils/user-media'

export enum ScannerAccessStatus {
  UNKNOWN = 1,
  GRANTED,
  DENIED,
}

export interface CustomBrowserMultiFormatReaderState {
  accessStatus: ScannerAccessStatus
  loading: boolean
  isActive: boolean
  result: string
  error: Error
  selectedDeviceId: string
  deviceList: Array<MediaDeviceInfo>
}

export class CustomBrowserMultiFormatReader {

  // constructor() {
  //   this.snap = this.snap.bind(this)
  //   this.start = this.start.bind(this)
  //   this.stop = this.stop.bind(this)
  //   this.reset = this.reset.bind(this)
  //   this.refreshDeviceList = this.refreshDeviceList.bind(this)
  //   this.forgetResult = this.forgetResult.bind(this)
  // }

  videoRef: MutableRefObject<HTMLVideoElement> = { current: null }

  reader = new BrowserMultiFormatReader()

  state = new RelinkSource<CustomBrowserMultiFormatReaderState>({
    key: Symbol(''),
    default: {
      accessStatus: ScannerAccessStatus.UNKNOWN,
      loading: true,
      isActive: false,
      result: null,
      error: null,
      selectedDeviceId: null,
      deviceList: [],
    },
  })

  async snap(): Promise<void> {
    const { loading, selectedDeviceId } = await this.state.getAsync()
    const isUserMediaSupported = hasUserMediaWithAlertIfUnavailable()
    if (loading || !isUserMediaSupported) { return } // Early exit
    try {
      const res = await this.reader.decodeOnceFromVideoDevice(selectedDeviceId)
      await this.state.set(s => ({
        ...s,
        error: null,
        accessStatus: ScannerAccessStatus.GRANTED,
      }))
      if (res) {
        await this.state.set(s => ({ ...s, result: res.getText() }))
      }
    } catch (e) {
      await this.state.set(s => ({ ...s, error: e }))
      if (e instanceof DOMException) {
        await this.state.set(s => ({
          ...s,
          accessStatus: ScannerAccessStatus.DENIED,
        }))
      }
    }
  }

  async start(): Promise<void> {
    const { loading, selectedDeviceId } = await this.state.getAsync()
    const isUserMediaSupported = hasUserMediaWithAlertIfUnavailable()
    if (loading || !isUserMediaSupported) { return } // Early exit
    try {
      await this.reader.decodeFromVideoDevice(
        selectedDeviceId,
        this.videoRef.current,
        async (res, err) => {
          await this.state.set(s => ({
            ...s,
            isActive: true,
            accessStatus: ScannerAccessStatus.GRANTED,
          }))
          if (res) {
            await this.state.set(s => ({ ...s, result: res.getText() }))
          }
          await this.state.set(s => ({ ...s, error: err ? err : null }))
          // As long as this error belongs into one of the following categories
          // the code reader is going to continue as excepted. Any other error
          // will stop the decoding loop.
          if (!(
            err instanceof ZXingFormatException ||
            // └─ No QR code found.
            err instanceof ZXingNotFoundException ||
            // └─ A code was found, but it\'s read value was not valid.
            err instanceof ZXingChecksumException
            // └─ A code was found, but it was in a invalid format.
          )) {
            await this.state.set(s => ({ ...s, isActive: false }))
          }
        }
      )
    } catch (e) {
      devWarn(e)
      if (e instanceof DOMException) {
        await this.state.set(s => ({
          ...s,
          accessStatus: ScannerAccessStatus.DENIED,
        }))
      }
    }
  }

  async stop(): Promise<void> {
    this.reader.reset()
    await this.state.set(s => ({ ...s, isActive: false }))
  }

  async reset(): Promise<void> {
    this.stop()
    await this.state.set(s => ({
      ...s,
      result: this.state.default.result,
      error: this.state.default.error,
      deviceList: this.state.default.deviceList,
    }))
  }

  async refreshDeviceList(): Promise<void> {
    try {
      await this.state.set(s => ({ ...s, loading: true }))
      const videoInputDevices = await this.reader.listVideoInputDevices()
      await this.state.set(s => ({ ...s, deviceList: videoInputDevices }))
    } catch (e) {
      devInfo('Error fetching device list')
      devError(e)
      await this.state.set(s => ({ ...s, error: e }))
    } finally {
      await this.state.set(s => ({ ...s, loading: false }))
    }
  }

  async forgetResult(): Promise<void> {
    await this.state.set(s => ({
      ...s,
      result: this.state.default.result,
    }))
  }

}

export function useCustomBrowserMultiFormatReader(): CustomBrowserMultiFormatReader {

  const customQRCodeReader = useRef(() => new CustomBrowserMultiFormatReader())

  useLayoutEffect(() => {
    customQRCodeReader.current.refreshDeviceList()
  }, [])

  useLayoutEffect(() => {
    if (IS_HUAWEI_DEVICE) {
      devInfo('Huawei device detected, attempting to override camera config...')
      navigator.mediaDevices.getUserMedia({
        video: {
          advanced: [{
            facingMode: {
              exact: 'environment',
            },
          }],
        },
      }).then(async (res) => {
        await customQRCodeReader.current.state.set(s => ({
          ...s,
          selectedDeviceId: res.id,
        }))
      }).catch((e) => {
        devError(e)
      })
    }
  }, [])

  return customQRCodeReader.current

}
