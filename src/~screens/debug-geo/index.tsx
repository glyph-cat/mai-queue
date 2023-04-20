import { ChangeEvent, useCallback, useState } from 'react'
import { TextButton } from '~components/form'
import { useGeolocationPosition } from '~services/geolocation'
import { useTheme } from '~services/theme'
import { checkIfCoordIsWithinRadius } from '~utils/coords-intersection'
import styles from './index.module.css'

const isStringEqual = (a: unknown, b: unknown): boolean => String(a) === String(b)

const defaultLatitude = 5.43951
const defaultLongitude = 100.3819734
const defaultRadius = 500

function DebugGeoScreen(): JSX.Element {

  const { palette } = useTheme()

  const [latitude, setLatitude] = useState(defaultLatitude)
  const [parsedLatitude, setParsedLatitude] = useState(latitude)
  const handleOnChangeLatitude = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLatitude(e.target.value as any)
    const parsedValue = Number(e.target.value)
    if (!Object.is(parsedValue, NaN)) {
      setParsedLatitude(parsedValue)
    }
  }, [])

  const [longitude, setLongitude] = useState(defaultLongitude)
  const [parsedLongitude, setParsedLongitude] = useState(longitude)
  const handleOnChangeLongitude = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLongitude(e.target.value as any)
    const parsedValue = Number(e.target.value)
    if (!Object.is(parsedValue, NaN)) {
      setParsedLongitude(parsedValue)
    }
  }, [])

  const [radius, setRadius] = useState(defaultRadius)
  const [parsedRadius, setParsedRadius] = useState(radius)
  const handleOnChangeRadius = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRadius(e.target.value as any)
    const parsedValue = Number(e.target.value)
    if (!Object.is(parsedValue, NaN)) {
      setParsedRadius(parsedValue)
    }
  }, [])

  const onHandleReset = useCallback(() => {
    setLatitude(defaultLatitude)
    setParsedLatitude(defaultLatitude)
    setLongitude(defaultLongitude)
    setParsedLongitude(defaultLongitude)
    setRadius(defaultRadius)
    setParsedRadius(defaultRadius)
  }, [])

  const geolocationPosition = useGeolocationPosition()
  const isWithinRadius = checkIfCoordIsWithinRadius(
    geolocationPosition.coords,
    { latitude: parsedLatitude, longitude: parsedLongitude, altitude: 0 },
    parsedRadius,
  )

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <span style={isStringEqual(radius, parsedRadius) ? {} : { color: '#ff4a4a' }}>
          {'Radius(m):'}
        </span>
        <input
          value={radius}
          onChange={handleOnChangeRadius}
        />
        <span style={isStringEqual(latitude, parsedLatitude) ? {} : { color: '#ff4a4a' }}>
          {'Target lat:'}
        </span>
        <input
          value={latitude}
          onChange={handleOnChangeLatitude}
        />
        <span style={isStringEqual(longitude, parsedLongitude) ? {} : { color: '#ff4a4a' }}>
          {'Target lon:'}
        </span>
        <input
          value={longitude}
          onChange={handleOnChangeLongitude}
        />
        <span>{'Current lat:'}</span>
        <input
          value={geolocationPosition?.coords?.latitude || 'UNKNOWN'}
          readOnly
        />
        <span>{'Current lon:'}</span>
        <input
          value={geolocationPosition?.coords?.longitude || 'UNKNOWN'}
          readOnly
        />
        <span>{'Current alt:'}</span>
        <input
          value={geolocationPosition?.coords?.altitude || 'UNKNOWN'}
          readOnly
        />
        <span>{'In radius:'}</span>
        <input
          value={isWithinRadius ? 'YES' : 'NO'}
          readOnly
          style={isWithinRadius ? {
            backgroundColor: '#aaffcc',
            borderColor: '#66cc66',
            color: '#008000',
            fontWeight: 'bold',
          } : {}}
        />
        <span>{'Permission:'}</span>
        <input
          value={geolocationPosition.isUserEnabled ? 'ALLOWED' : 'BLOCKED'}
          style={geolocationPosition.isUserEnabled !== true ? {
            backgroundColor: '#ffcccc',
            borderColor: '#ff6666',
            color: '#ff0000',
            fontWeight: 'bold',
          } : {}}
          readOnly
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <TextButton
          label={'Reset'}
          color={palette.primaryOrange}
          onPress={onHandleReset}
        />
      </div>
    </div>
  )
}

export default DebugGeoScreen
