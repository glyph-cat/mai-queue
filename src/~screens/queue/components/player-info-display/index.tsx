import { Nullable } from '@glyph-cat/swiss-army-knife'
import { GuestInfoDisplay } from '../guest-info-display'
import styles from './index.module.css'

export interface PlayerInfoDisplayProps {
  bannerUrl: Nullable<string>
  playerName: string
  isRetrievingPlayerInfo?: boolean
}

export function PlayerInfoDisplay({
  bannerUrl,
  playerName,
  isRetrievingPlayerInfo,
}: PlayerInfoDisplayProps): JSX.Element {
  return (
    <div className={styles.container}>
      {bannerUrl
        ? <img className={styles.bannerImage} src={bannerUrl} />
        : <GuestInfoDisplay
          playerName={playerName}
          isRetrievingPlayerInfo={isRetrievingPlayerInfo}
        />
      }
    </div>
  )
}
