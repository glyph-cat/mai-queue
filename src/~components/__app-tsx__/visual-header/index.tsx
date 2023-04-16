import { MaterialIcon, MaterialIconProps } from '@glyph-cat/swiss-army-knife'
import Link from 'next/link'
import { useCallback } from 'react'
import { CustomDialog } from '~components/custom-dialog'
import { PROJECT_NAME } from '~constants'
import { useArcadeInfo } from '~services/arcade-info'
import { CLIENT_ROUTE } from '~services/navigation'
import { useTheme } from '~services/theme'
import { formatArcadeName } from '~utils/format-arcade-name'
import styles from './index.module.css'

export const VISUAL_HEADER_SIZE = 48 // px

export function VisualHeader(): JSX.Element {
  const notificationCount = 0
  const currentArcade = useArcadeInfo()
  const onRequestShowNotifications = useCallback(async () => {
    await CustomDialog.alert(<>{'You queue location is set to'}<br />{formatArcadeName(currentArcade)}</>)
  }, [currentArcade])

  const haveReportsToShow = notificationCount > 0
  // TODO: [Low priority] `&& unread notifications`

  return (
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
      <IconButton
        // @ts-ignore - TOFIX: [Mid priority] In '@glyph-cat/swiss-army-knife'
        icon={haveReportsToShow ? 'crisis_alert' : 'info'}
        onPress={onRequestShowNotifications}
        emphasis={haveReportsToShow}
      />
    </nav>
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
