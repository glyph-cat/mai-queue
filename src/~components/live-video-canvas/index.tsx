import { useWindowDimensions } from '@glyph-cat/swiss-army-knife'
import { MutableRefObject, ReactNode, useCallback, useState } from 'react'
import { Spinner } from '~components/spinner'
import styles from './index.module.css'

export interface LiveVideoCanvasProps {
  videoRef: MutableRefObject<HTMLVideoElement>
  loading?: boolean
  loadingHint?: ReactNode
}

export function LiveVideoCanvas({
  videoRef,
  loading,
  loadingHint,
}: LiveVideoCanvasProps): JSX.Element {
  const windowDimensions = useWindowDimensions()
  const size = 0.55 * windowDimensions.width
  const [buffering, setBufferStatus] = useState(true)
  const handleOnPlay = useCallback(() => { setBufferStatus(false) }, [])
  const isBusy = buffering || loading
  return (
    <div className={styles.container}>
      <video
        controls={false}
        className={styles.video}
        height={size}
        width={size}
        onCanPlay={handleOnPlay}
        ref={videoRef}
        style={isBusy ? { opacity: 0.35 } : {}}
        muted={true}
      />
      {isBusy && (
        <div className={styles.spinnerContainer}>
          <Spinner />
          {loadingHint && <span className={styles.loadingHint}>{loadingHint}</span>}
        </div>
      )}
    </div>
  )
}
