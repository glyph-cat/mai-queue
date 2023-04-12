import {
  concatClassNames,
  MaterialIcon,
  MaterialIconName,
} from '@glyph-cat/swiss-army-knife'
import styles from './index.module.css'

export interface StepButtonProps {
  icon: MaterialIconName
  onPress(): void
  /**
   * @defaultValue `false`
   */
  disabled?: boolean
  /**
   * @defaultValue `false`
   */
  hidden?: boolean
}

export function StepButton({
  icon,
  onPress,
  disabled,
  hidden,
}: StepButtonProps): JSX.Element {
  const isPressable = !disabled && !hidden
  return (
    <div
      className={concatClassNames(
        styles.stepButton,
        disabled ? styles.stepButtonDisabled : styles.stepButtonEnabled,
      )}
      onClick={isPressable ? onPress : null}
      {...(isPressable ? { tabIndex: 0 } : {})}
      style={hidden ? { opacity: 0 } : {}}
      role='button'
    >
      <MaterialIcon name={icon} />
    </div>
  )
}
