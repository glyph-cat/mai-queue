import { onSnapshot, Query, QuerySnapshot } from 'firebase/firestore'
import { DateTime } from 'luxon'
import { useEffect } from 'react'
import { RelinkSelector, RelinkSource, useRelinkValue } from 'react-relink'
import {
  IQueueFetchingBaseSource,
  IQueueTicket,
  ITicketsModelObject,
} from '~abstractions'
import { Field } from '~constants'
import { useArcadeInfo } from '~services/arcade-info'
import { ArcadeInfo } from '~services/arcade-info/abstractions'
import { DataSubscriptionHookCoordinator } from '~unstable/hook-coordinator'

export class QueueListener {

  private source: RelinkSource<IQueueFetchingBaseSource>

  private coordinator = new DataSubscriptionHookCoordinator()

  constructor(
    key: string,
    private queryBuilder: (arcadeInfo: ArcadeInfo) => Query<ITicketsModelObject>,
    private sortFn: (a: IQueueTicket, b: IQueueTicket) => number
  ) {
    this.source = new RelinkSource<IQueueFetchingBaseSource>({
      key: `queue/${key}`,
      default: {
        lastFetched: null,
        data: [],
      },
    })
    this.useQueueConsumer = this.useQueueConsumer.bind(this)
  }

  useQueueConsumer(
    selector?: null,
    active?: boolean
  ): IQueueFetchingBaseSource

  useQueueConsumer<SelectedState>(
    selector: RelinkSelector<IQueueFetchingBaseSource, SelectedState>,
    active?: boolean
  ): SelectedState

  useQueueConsumer<SelectedState>(
    selector?: RelinkSelector<IQueueFetchingBaseSource, SelectedState>,
    active = true
  ): IQueueFetchingBaseSource | SelectedState {
    this.coordinator.useAsConsumer(active)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRelinkValue(this.source, selector, active)
  }

  useQueueProvider = (): void => {
    const currentArcade = useArcadeInfo()
    const shouldBeActive = this.coordinator.useAsProvider()
    useEffect(() => {
      if (!currentArcade) { return } // Early exit
      if (!shouldBeActive) { return } // Early exit
      const query = this.queryBuilder(currentArcade)
      const unsubscribeListener = onSnapshot(query, async (querySnapshot) => {
        const fetchTime = DateTime.now()
        await this.source.set((previousState) => ({
          lastFetched: fetchTime,
          data: convertQuerySnapshotToArray(
            previousState.data,
            querySnapshot,
            fetchTime
          ).sort(this.sortFn),
        }))
      })
      return () => { unsubscribeListener() }
    }, [currentArcade, shouldBeActive])
  }

}

function convertQuerySnapshotToArray(
  existingQueueItems: Array<IQueueTicket>,
  querySnapshot: QuerySnapshot<ITicketsModelObject>,
  fetchTime: DateTime
): Array<IQueueTicket> {
  const queueItemStack: Array<IQueueTicket> = []
  let positionInQueue = 0
  querySnapshot.forEach((docSnapshot) => {
    const docData = docSnapshot.data()
    const prevSnapshot = existingQueueItems.find((item) => item.id === docSnapshot.id)
    queueItemStack.push({
      id: docSnapshot.id,
      ticketNumber: docData[Field.ticketNumber],
      positionInQueue: positionInQueue++,
      playerName: docData[Field.playerName],
      bannerUrl: docData[Field.bannerUrl],
      deviceKey: docData[Field.deviceKey],
      cTime: docData[Field.cTime],
      friendCode: docData[Field.friendCode],
      firstObservationTime: prevSnapshot ? prevSnapshot.firstObservationTime : fetchTime,
      xTime: docData[Field.xTime],
      xReason: docData[Field.xReason],
      staleFlags: docData[Field.staleFlags],
    })
  })
  return queueItemStack
}
