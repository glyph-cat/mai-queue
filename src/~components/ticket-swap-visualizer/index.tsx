import { MaterialIcon } from '@glyph-cat/swiss-army-knife'
import { PlayerInfoDisplay } from '~screens/queue/components/player-info-display'
import styles from './index.module.css'

export interface TicketSwapVisualizerProps {
  selfNumber: number
  engagedNumber: number
  engagedPlayerName: string
  engagedPlayerBannerUrl: string
}

export function TicketSwapVisualizer({
  selfNumber,
  engagedNumber,
  engagedPlayerName,
  engagedPlayerBannerUrl,
}: TicketSwapVisualizerProps): JSX.Element {
  return (
    <div className={styles.container}>
      {engagedPlayerBannerUrl && (
        <div className={styles.playerInfoDisplay}>
          <PlayerInfoDisplay bannerUrl={engagedPlayerBannerUrl} playerName={null} />
        </div>
      )}
      <div className={styles.swapInfoContainer}>
        <div className={styles.swapInfoSubContainer}>
          <div>
            <span className={styles.number}>
              {selfNumber}
            </span>
            <span className={styles.numberLabel}>You</span>
          </div>
          <div className={styles.arrowContainer}>
            <MaterialIcon name='swap_horiz' size={48} />
          </div>
          <div style={{ color: '#d95e1c' }}>
            <span className={styles.number}>
              {engagedNumber}
            </span>
            <span className={styles.numberLabel}>{engagedPlayerName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
