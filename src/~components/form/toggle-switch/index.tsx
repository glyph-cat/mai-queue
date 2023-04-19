import { concatClassNames } from '@glyph-cat/swiss-army-knife'
import { ReactNode, useCallback } from 'react'
import styles from './index.module.css'

export interface ToggleSwitchProps {
  value: boolean
  onChange(newValue: boolean): void
}

export function ToggleSwitch({
  value,
  onChange,
}: ToggleSwitchProps): JSX.Element {

  const handleOnChange = useCallback(() => {
    onChange(!value)
  }, [onChange, value])

  return (
    <div
      className={concatClassNames(
        styles.container,
        value ? styles.containerOn : null,
      )}
      onClick={handleOnChange}
    >
      <div className={concatClassNames(
        styles.orb,
        value ? styles.orbOn : null,
      )} />
    </div>
  )
}

export interface ToggleSwitchWithLabelProps extends ToggleSwitchProps {
  label: ReactNode
}

export function ToggleSwitchWithLabel({
  label,
  ...toggleSwitchProps
}: ToggleSwitchWithLabelProps): JSX.Element {
  return (
    <div className={styles.withLabelContainer}>
      <span className={styles.label}>{label}</span>
      <ToggleSwitch {...toggleSwitchProps} />
    </div>
  )
}
