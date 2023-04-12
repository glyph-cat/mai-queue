import { useVersioningMetadata } from '~hooks/versioning'
import { useCurrentQueueProvider } from '~services/queue-watcher/current'
import { useLastPlayedQueueProvider } from '~services/queue-watcher/last-played'
import { usePastQueueProvider } from '~services/queue-watcher/past'
import { useWebWorker } from '~services/web-worker'

/**
 * The hooks are not used in directly in '_app.tsx' so that non-concerning
 * state changes (if any) won't cause <App/> to re-render.
 */
export function WatchersAndListeners(): JSX.Element {

  // Listeners
  useCurrentQueueProvider()
  usePastQueueProvider()
  useLastPlayedQueueProvider()
  useWebWorker()

  // Miscellaneous
  useVersioningMetadata()

  return null
}
