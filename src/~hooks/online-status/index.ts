import { JSFunction } from '@glyph-cat/swiss-army-knife'
import { useSyncExternalStore } from 'react'

function subscribe(callback: JSFunction) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

const getSnapshot = (): boolean => navigator.onLine
const getServerSnapshot = (): boolean => true

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
