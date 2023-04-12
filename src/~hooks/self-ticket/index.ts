import { useRelinkValue } from 'react-relink'
import { IQueueTicket } from '~abstractions'
import { useCurrentQueueConsumer } from '~services/queue-watcher/current'
import { ConfigSource } from '~sources/config'

/**
 * @returns A {@link IQueueTicket} if player has taken a ticket, otherwise `null`.
 */
export function useSelfTicket(): IQueueTicket {
  const deviceKey = useRelinkValue(ConfigSource, (s) => s.deviceKey)
  const selfTicket = useCurrentQueueConsumer((q) => {
    return q.data.find((item) => item.deviceKey === deviceKey) || null
  })
  return selfTicket
}
