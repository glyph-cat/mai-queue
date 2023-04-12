import { HttpStatus } from '@glyph-cat/swiss-army-knife'
import { useCallback, useState } from 'react'
import { Ghost } from 'react-kawaii'
import styles from './index.module.css'

export interface FatalErrorFallbackUIProps {
  httpCode?: HttpStatus
  title: string
  message?: string
  error?: Error
}

export function FatalErrorFallbackUI({
  title,
  httpCode,
  message,
  error,
}: FatalErrorFallbackUIProps): JSX.Element {

  const [stringifiedError, setStringifiedError] = useState<Record<string, unknown>>(null)

  const onRequestTechnicalDetails = useCallback(() => {
    setStringifiedError(stringifyError(error))
  }, [error])

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h1 className={styles.title}>
          {httpCode && `${httpCode}｜`}
          {title}
        </h1>
        <span className={styles.message}>{message}</span>
        <Ghost mood='ko' />
        {error && (
          <details>
            <summary onClick={onRequestTechnicalDetails}>Technical details</summary>
            {stringifiedError && (
              <pre className={styles.codeSection}>
                {JSON.stringify(stringifyError(error), null, 2)}
              </pre>
            )}
          </details>
        )}
      </div>
    </div>
  )
}

function stringifyError(error: Error): Record<string, unknown> {
  const obj = {}
  if (error.name) {
    obj['name'] = error.name
  }
  if (error.message) {
    obj['message'] = error.message
  }
  if (error.stack) {
    obj['stack'] = error.stack
  }
  return obj
}
