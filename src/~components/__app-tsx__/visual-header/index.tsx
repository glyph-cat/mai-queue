import { MaterialIcon, MaterialIconProps } from '@glyph-cat/swiss-army-knife'
import Link from 'next/link'
import { useCallback } from 'react'
import { PROJECT_NAME } from '~constants'
import { CLIENT_ROUTE } from '~services/navigation'
import { useTheme } from '~services/theme'
import styles from './index.module.css'

export const VISUAL_HEADER_SIZE = 48 // px

export function VisualHeader(): JSX.Element {
  const notificationCount = 10
  const onRequestShowNotifications = useCallback(() => {
    // ...
  }, [])

  const showEmphasis = notificationCount > 0
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
      {false && ( // Temporarily hidden
        <IconButton
          // @ts-ignore - TOFIX: [Mid priority] In '@glyph-cat/swiss-army-knife'
          icon='crisis_alert'
          onPress={onRequestShowNotifications}
          emphasis={showEmphasis}
        />
      )}
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
      <div className={styles.emphasisRipple} />
      <MaterialIcon
        name={icon}
        {...(emphasis ? { color: palette.dangerRed } : {})}
      />
    </div>
  )
}
