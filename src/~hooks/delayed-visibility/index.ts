import { useEffect, useState } from 'react'

export function useDelayedVisibility(visible: boolean): boolean {
  const [delayedVisible, setDelayedVisibility] = useState(false)
  useEffect(() => { setDelayedVisibility(visible) }, [visible])
  return delayedVisible
}
