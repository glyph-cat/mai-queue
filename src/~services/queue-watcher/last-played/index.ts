import { limit, orderBy, query, where } from 'firebase/firestore'
import { CloseTicketReason } from '~abstractions'
import { Field, NUMBER_OF_SIDES_PER_CABINET } from '~constants'
import { DBCollection } from '~services/firebase-client'
import { QueueListener } from '../_queue-listener_'

const queueListener = new QueueListener('last-played', (currentArcade) => query(
  DBCollection.Tickets,
  where(Field.arcadeId, '==', currentArcade.id),
  where(Field.xReason, '==', CloseTicketReason.CLOSE),
  orderBy(Field.xTime, 'desc'),
  limit(currentArcade.cabinetCount * NUMBER_OF_SIDES_PER_CABINET),
), (a, b) => {
  if (!a.cTime.equals(b.cTime)) {
    const diff = a.cTime.diff(b.cTime).as('milliseconds')
    return diff > 0 ? -1 : 1
  } else if (a.ticketNumber !== b.ticketNumber) {
    return a.ticketNumber > b.ticketNumber ? -1 : 1
  } else {
    return 0
  }
})

export const useLastPlayedQueueConsumer = queueListener.useQueueConsumer
export const useLastPlayedQueueProvider = queueListener.useQueueProvider
