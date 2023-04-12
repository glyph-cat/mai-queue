import { isNumber } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

// TODO: [Low priority] Transfer to '@glyph-cat/swiss-army-knife'

export function useCurrentDateTime(refreshInterval?: number): DateTime {
  const [currentDateTime, setCurrentDateTime] = useState<DateTime>(DateTime.now)
  useEffect(() => {
    if (isNumber(refreshInterval)) {
      const intervalRef = setInterval(() => {
        setCurrentDateTime(DateTime.now())
      }, refreshInterval)
      return () => { clearInterval(intervalRef) }
    }
  }, [refreshInterval])
  return currentDateTime
}
