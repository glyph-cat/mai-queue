import { concatClassNames } from '@glyph-cat/swiss-army-knife'
import { Property } from 'csstype'
import { Spinner } from '~components/spinner'
import { useTheme } from '~services/theme'
import styles from './index.module.css'
import { CSSProperties } from 'react'

export interface TextButtonProps {
  label: string
  onPress(): void
  color?: Property.Color
  type?: 'primary' | 'neutral' | 'destructive' | 'safe'
  disabled?: boolean
  loading?: boolean
  style?: CSSProperties
}

export function TextButton({
  label,
  onPress,
  color,
  type,
  disabled,
  loading,
  style,
}: TextButtonProps): JSX.Element {
  const { palette } = useTheme()
  const shouldBlockButton = disabled || loading

  const bgColor = shouldBlockButton
    ? '#aaaaaa'
    : color
      ? color
      : type === 'primary'
        ? palette.primaryOrange
        : type === 'destructive'
          ? palette.dangerRed
          : type === 'safe'
            ? palette.safeGreen
            : palette.neutralFill
  const fgColor = palette.fixedWhite
  // TODO: [Low priority] Automatic black/white `fgColor` based on `bgColor`

  return (
    <div
      className={concatClassNames(
        styles.containerBase,
        shouldBlockButton ? styles.containerDisabled : styles.containerEnabled,
        styles.containerL
      )}
      onClick={shouldBlockButton ? undefined : onPress}
      style={{ backgroundColor: bgColor, color: fgColor, ...style }}
      tabIndex={0}
      role='button'
    >
      {loading
        ? <Spinner
          bgColor={`${fgColor}80`}
          fgColor={palette.fixedWhite}
          size={24}
          thickness={3}
        />
        : label
      }
    </div>
  )
}
