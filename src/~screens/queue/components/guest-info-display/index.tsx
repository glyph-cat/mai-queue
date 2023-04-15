import { Spinner } from '~components/spinner'
import styles from './index.module.css'

// NOTE: No ellipsis is needed because maimai IGN are limited to 8 characters

export interface GuestInfoDisplayProps {
  playerName: string
  isRetrievingPlayerInfo: boolean
}

export function GuestInfoDisplay({
  playerName,
  isRetrievingPlayerInfo,
}: GuestInfoDisplayProps): JSX.Element {
  return (
    <div className={styles.guestContainer}>
      <div className={styles.guestSubContainer}>
        <div className={styles.guestName}>{playerName}</div>
        {isRetrievingPlayerInfo && (
          <div className={styles.retrievalInfo}>
            <Spinner size={28} />
            <span>Retrieving player info...</span>
          </div>
        )}
      </div>
    </div>
  )
}
