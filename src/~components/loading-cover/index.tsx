import { delay, DynamicTruthMap, isFunction } from '@glyph-cat/swiss-army-knife'
import { useEffect, useState } from 'react'
import { AnimatedBackdrop } from '~components/animated-backdrop'
import { Spinner } from '~components/spinner'
import { ANIMATED_BACKDROP_TRANSITION_DURATION } from '~constants'
import { useTheme } from '~services/theme'
import styles from './index.module.css'

let __GLOBAL_REF_REFRESH_LOADING_COVER__ = null

function triggerRefresh(): void {
  if (isFunction(__GLOBAL_REF_REFRESH_LOADING_COVER__)) {
    __GLOBAL_REF_REFRESH_LOADING_COVER__()
  }
}

let __hookerCollection__ = new DynamicTruthMap()

let __counter__ = 0

function getNewId(): number { return ++__counter__ }

function showLoadingCover(): number {
  const newId = getNewId()
  __hookerCollection__ = __hookerCollection__.add(newId)
  triggerRefresh()
  return newId
}

function hideLoadingCover(id: number): void {
  __hookerCollection__ = __hookerCollection__.remove(id)
  triggerRefresh()
}

function useLoadingCover_INTERNAL(visible: boolean): void {
  useEffect(() => {
    if (visible) {
      const id = showLoadingCover()
      return () => {
        hideLoadingCover(id)
      }
    }
  }, [visible])
}

export interface LoadingCoverProps {
  /**
   * @defaultValue `true`
   */
  visible?: boolean
}

export function LoadingCover({
  visible = true,
}: LoadingCoverProps): JSX.Element {
  useLoadingCover_INTERNAL(visible)
  return null
}

export function LoadingCoverCanvas(): JSX.Element {
  const [isVisible, setVisibility] = useState(false)
  const [shouldMount, setMountState] = useState(false)
  useEffect(() => {
    let timeoutRef: ReturnType<typeof setTimeout>
    const refresh = async () => {
      const hookerList = __hookerCollection__.getKeys()
      const shouldBeVisible = hookerList.length > 0
      if (shouldBeVisible) {
        setMountState(true)
        await delay(10)
        setVisibility(true)
        // NOTE: This allows HTML elements to mount with `opacity: 0` then only
        // gradually increase opacity with CSS, instead of directly mounting it
        // with `opacity: 1`
      } else {
        setVisibility(false)
        await delay(ANIMATED_BACKDROP_TRANSITION_DURATION)
        setMountState(false)
        // This allows the opacity to change to 0, then only completely unmount
      }
    }
    __GLOBAL_REF_REFRESH_LOADING_COVER__ = refresh
    refresh()
    return () => {
      clearTimeout(timeoutRef)
      __GLOBAL_REF_REFRESH_LOADING_COVER__ = null
    }
  }, [])
  return shouldMount && <LoadingCoverVisualElement visible={isVisible} />
}

interface LoadingCoverVisualElementProps {
  visible: boolean
}

function LoadingCoverVisualElement({
  visible,
}: LoadingCoverVisualElementProps): JSX.Element {
  const { palette } = useTheme()
  return (
    <AnimatedBackdrop visible={visible}>
      <div className={styles.innerContainer}>
        <Spinner
          bgColor={`${palette.fixedWhite}80`}
          fgColor={palette.fixedWhite}
        />
        <span className={styles.label}>{'Please wait...'}</span>
      </div>
    </AnimatedBackdrop>
  )
}
