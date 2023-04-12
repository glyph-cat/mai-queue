import { concatClassNames } from '@glyph-cat/swiss-army-knife'
import { GlobalStyles } from '~constants'
import styles from './index.module.css'

export interface LinkButtonProps {
  label: string
  onPress(): void
  disabled?: boolean
}

export function LinkButton({
  label,
  onPress,
  disabled,
}: LinkButtonProps): JSX.Element {
  return (
    <span
      className={concatClassNames(
        GlobalStyles.anchor,
        disabled ? styles.disabled : null,
      )}
      onClick={disabled ? undefined : onPress}
    >
      {label}
    </span>
  )
}
