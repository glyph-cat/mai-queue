import { Watcher } from '@glyph-cat/swiss-army-knife'
import { useEffect, useId, useReducer } from 'react'

// TODO: [Low priority] Transfer to '@glyph-cat/swiss-army-knife'

export class DataSubscriptionHookCoordinator {

  private __hookWatchers__: Record<string, true> = {}

  private currentQueueHookWatcher = new Watcher()

  private shouldProviderBeActive = (): boolean => {
    return Object.keys(this.__hookWatchers__).length > 0
  }

  useAsConsumer = (active: boolean): void => {
    const hookId = useId()
    useEffect(() => {
      if (!active) { return }
      this.__hookWatchers__[hookId] = true
      this.currentQueueHookWatcher.refresh()
      return () => {
        delete this.__hookWatchers__[hookId]
        this.currentQueueHookWatcher.refresh()
      }
    }, [active, hookId])
  }

  useAsProvider = (): boolean => {
    const [shouldBeActive, setActiveStatus] = useReducer(
      this.shouldProviderBeActive,
      false,
      this.shouldProviderBeActive,
    )
    useEffect(() => {
      return this.currentQueueHookWatcher.watch(setActiveStatus)
    }, [])
    return shouldBeActive
  }

}
