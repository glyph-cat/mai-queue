import { useEffect, useState } from 'react'
import { useOnlineStatus } from '~hooks/online-status'
import styles from './index.module.css'

export function OnlineStatusBanner(): JSX.Element {
  const isOnline = useOnlineStatus()
  const [delayedIsOnline, setDelayedOnlineStatus] = useState(true)
  useEffect(() => {
    if (isOnline) {
      const timeoutRef = setTimeout(() => {
        setDelayedOnlineStatus(true)
      }, 3000)
      return () => { clearTimeout(timeoutRef) }
    } else {
      setDelayedOnlineStatus(false)
    }
  }, [isOnline])
  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: isOnline ? '#008000' : '#ff2a2a',
        height: delayedIsOnline ? 0 : 42,
        transform: delayedIsOnline ? 'translateY(-42px)' : 'translateY(0)',
      }}
    >
      {isOnline ? 'Internet connection restored' : 'No internet connection'}
    </div>
  )
}
