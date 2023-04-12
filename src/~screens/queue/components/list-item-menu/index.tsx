import { useCallback } from 'react'
import { CustomDialogButtonContainer } from '~components/custom-dialog/components'
import { useCustomDialogFreeformContext } from '~components/custom-dialog/freeform'
import { TextButton } from '~components/form'
import { PlayerInfoDisplay } from '~screens/queue/components/player-info-display'
import { useTheme } from '~services/theme'
import styles from './index.module.css'

export enum ListItemMenuResponse {
  REQUEST_SWAP = 1,
  REPORT_STALE,
}

export interface ListItemMenuProps {
  playerName: string
  bannerUrl: string
  alreadyFlaggedAsStale: boolean
  staleFlagCount: number
  isProbablyStale: boolean
}

export function ListItemMenu({
  playerName,
  bannerUrl,
  alreadyFlaggedAsStale,
  staleFlagCount,
  isProbablyStale,
}: ListItemMenuProps): JSX.Element {

  const { cancel, submit } = useCustomDialogFreeformContext()
  const { palette } = useTheme()

  const onSubmitRequestSwap = useCallback(() => {
    submit(ListItemMenuResponse.REQUEST_SWAP)
  }, [submit])

  const onSubmitReportStale = useCallback(() => {
    submit(ListItemMenuResponse.REPORT_STALE)
  }, [submit])

  return (
    <div className={styles.container}>
      <span className={styles.playerName}>{playerName}</span>
      {bannerUrl && (
        <PlayerInfoDisplay
          playerName={playerName}
          bannerUrl={bannerUrl}
        />
      )}
      {staleFlagCount > 0 && (
        <span className={styles.staleHint}>
          {`(Flagged by ${staleFlagCount} player${staleFlagCount === 1 ? '' : 's'} as stale)`}
        </span>
      )}
      <CustomDialogButtonContainer>
        <TextButton
          label='Request swap'
          onPress={onSubmitRequestSwap}
          color={palette.primaryOrange}
        />
        {isProbablyStale && (
          <TextButton
            label={alreadyFlaggedAsStale ? 'Already reported' : 'Report stale'}
            onPress={onSubmitReportStale}
            color={palette.acidColor}
            disabled={alreadyFlaggedAsStale}
          />
        )}
        <TextButton
          label='Cancel'
          onPress={cancel}
          color={palette.neutralFill}
        />
      </CustomDialogButtonContainer>
    </div>
  )
}
