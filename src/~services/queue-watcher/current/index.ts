import { orderBy, query, where } from 'firebase/firestore'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-client'
import { QueueListener } from '../_queue-listener_'

const queueListener = new QueueListener('current', (currentArcade) => query(
  DBCollection.Tickets,
  where(Field.arcadeId, '==', currentArcade.id),
  where(Field.xTime, '==', null),
  orderBy(Field.cTime, 'asc'),
), (a, b) => {
  if (a.ticketNumber !== b.ticketNumber) {
    return a.ticketNumber < b.ticketNumber ? -1 : 1
  } else if (!a.cTime.equals(b.cTime)) {
    const diff = a.cTime.diff(b.cTime).as('milliseconds')
    return diff < 0 ? -1 : 1
  } else {
    return 0
  }
})

export const useCurrentQueueConsumer = queueListener.useQueueConsumer
export const useCurrentQueueProvider = queueListener.useQueueProvider
