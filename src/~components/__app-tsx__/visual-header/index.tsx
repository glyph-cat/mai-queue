import { MaterialIcon, MaterialIconProps } from '@glyph-cat/swiss-army-knife'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { PROJECT_NAME } from '~constants'
import { IncidentReportSource, useArcadeInfo } from '~services/arcade-info'
import { CLIENT_ROUTE } from '~services/navigation'
import { useTheme } from '~services/theme'
import { ArcadeInfoPopup } from '../arcade-info-popup'
import styles from './index.module.css'

export const VISUAL_HEADER_SIZE = 48 // px

export function VisualHeader(): JSX.Element {

  const currentArcade = useArcadeInfo()
  const hasOngoingIncidents = useRelinkValue(IncidentReportSource, (s) => s.hasOngoingIncidents)

  const [shouldShowArcadeInfoPopup, setArcadeInfoPopupVisibility] = useState(false)
  const showArcadeInfoPopup = useCallback(async () => {
    setArcadeInfoPopupVisibility(true)
  }, [])
  const hideArcadeInfoPopup = useCallback(async () => {
    setArcadeInfoPopupVisibility(false)
  }, [])

  return (
    <>
      <nav
        className={styles.container}
        style={{
          gridTemplateColumns: `${VISUAL_HEADER_SIZE}px 1fr ${VISUAL_HEADER_SIZE}px`,
          height: VISUAL_HEADER_SIZE,
        }}
      >
        <div />
        <div style={{ placeItems: 'center' }}>
          <Link href={CLIENT_ROUTE.root} className={styles.title}>
            {`~ ${PROJECT_NAME} ~`}
          </Link>
        </div>
        {currentArcade && (
          <IconButton
            // @ts-ignore - TOFIX: [Mid priority] In '@glyph-cat/swiss-army-knife'
            icon={hasOngoingIncidents ? 'crisis_alert' : 'info'}
            onPress={showArcadeInfoPopup}
            emphasis={hasOngoingIncidents}
          />
        )}
      </nav>
      {shouldShowArcadeInfoPopup && <ArcadeInfoPopup onDismiss={hideArcadeInfoPopup} />}
    </>
  )
}

interface IconButtonProps {
  icon: MaterialIconProps['name']
  onPress(): void
  emphasis?: boolean
}

function IconButton({
  icon,
  onPress,
  emphasis,
}: IconButtonProps): JSX.Element {
  const { palette } = useTheme()
  return (
    <div
      className={styles.iconButton}
      role='button'
      onClick={onPress}
    >
      {emphasis && <div className={styles.emphasisRipple} />}
      <MaterialIcon
        name={icon}
        {...(emphasis ? { color: palette.dangerRed } : {})}
      />
    </div>
  )
}
