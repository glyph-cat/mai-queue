import { isNumber } from '@glyph-cat/swiss-army-knife'
import { DateTime, Duration } from 'luxon'
import { useMemo } from 'react'
import { IQueueTicket } from '~abstractions'
import { ESTIMATED_PLAY_TIME_PER_ROUND, NUMBER_OF_SIDES_PER_CABINET } from '~constants'
import { InternalClientError } from '~errors'
import { useCurrentDateTime } from '~hooks/current-datetime'
import { useArcadeInfo } from '~services/arcade-info'
import { useLastPlayedQueueConsumer } from '~services/queue-watcher/last-played'

/**
 * @returns The estimated waiting time in minutes if `positionOfTicketInQueue`
 * can be resolved, otherwise `NaN`.
 */
export function useEstimatedWaitingTime(positionOfTicketInQueue: number): number {
  const arcadeInfo = useArcadeInfo()
  const hasTicket = isNumber(positionOfTicketInQueue)
  const currentDateTime = useCurrentDateTime(hasTicket ? 60000 : null)
  const lastPlayedQueue = useLastPlayedQueueConsumer((s) => s.data, hasTicket)
  return useMemo(() => {
    if (!hasTicket) { return NaN }
    return getEstimatedWaitingTime(
      lastPlayedQueue,
      positionOfTicketInQueue,
      arcadeInfo.cabinetCount,
      currentDateTime
    )
  }, [arcadeInfo.cabinetCount, currentDateTime, hasTicket, lastPlayedQueue, positionOfTicketInQueue])
}

/**
 * @internal
 */
export function mapXtimeStackToLastNClosedTicketsWithAutofill(
  lastNClosedTickets: Array<IQueueTicket>,
  cabinetCount: number,
  currentDateTime: DateTime,
): Array<DateTime> {
  const xtimeStack = lastNClosedTickets.map((item) => item.xTime)
  const requiredSampleSize = cabinetCount * NUMBER_OF_SIDES_PER_CABINET
  if (xtimeStack.length < requiredSampleSize) {
    // Assuming it's just the start of the queue and there's not enough data
    // samples, this would also (most likely) mean that the other cabinets are
    // still vacant. So we should assign the next players to the empty cabinets
    // first.
    const assumedXtime = currentDateTime.minus(Duration.fromObject({
      minutes: ESTIMATED_PLAY_TIME_PER_ROUND,
    }))
    const assumedSamplesNeeded = requiredSampleSize - xtimeStack.length
    xtimeStack.unshift(...new Array(assumedSamplesNeeded).fill(assumedXtime))
  }
  return xtimeStack
}

/**
 * @returns The estimated waiting time in minutes.
 * @internal
 */
export function getEstimatedWaitingTime(
  lastNClosedTickets: Array<IQueueTicket>,
  positionOfTicketInQueue: number,
  cabinetCount: number,
  currentDateTime: DateTime
): number {
  const xtimeStack = mapXtimeStackToLastNClosedTicketsWithAutofill(
    lastNClosedTickets,
    cabinetCount,
    currentDateTime,
  )
  const aggregation = getAggregatedAverage(cabinetCount, xtimeStack)
  const prevCabinetXTime = aggregation[positionOfTicketInQueue % cabinetCount]
  const estimatedCurrentCabinetXtime = prevCabinetXTime.plus({ minutes: 15 })
  const baseWaitTime = Math.floor(estimatedCurrentCabinetXtime.diff(currentDateTime).as('minutes'))
  const stackedWaitTime = Math.floor((positionOfTicketInQueue / NUMBER_OF_SIDES_PER_CABINET) / cabinetCount)
  return Math.floor(baseWaitTime + (stackedWaitTime * ESTIMATED_PLAY_TIME_PER_ROUND))
}

/**
 * @example // Refer to test
 * @internal
 */
export function getAggregatedAverage(
  cabinetCount: number,
  xtimeStack: Array<DateTime>
): Array<DateTime> {
  if (xtimeStack.length !== cabinetCount * NUMBER_OF_SIDES_PER_CABINET) {
    throw new InternalClientError(`X1-${[cabinetCount, cabinetCount * 2, xtimeStack.length]}`)
  }
  const sortedXtimeStack = [...xtimeStack].sort()
  const aggregation: Array<DateTime> = []
  const threshold = 120 // seconds
  for (let i = 1; i < sortedXtimeStack.length; i++) {
    const current = sortedXtimeStack[i - 1]
    const next = sortedXtimeStack[i]
    const diff = next.diff(current).as('seconds')
    if (diff < threshold) {
      // Normal case - timestamps are "closed enough"
      aggregation.push(getDatetimeAverage(current, next))
      i++ // Treating `i` as a pointer, we move it forward by one because
      ////// the "next" timestamp is already used in the current iteration.
    } else {
      // Timestamps are "too far apart"
      aggregation.push(current)
    }
  }
  return aggregation
}

/**
 * @example // Refer to test
 * @returns The midpoint of `a` and `b`.
 * @internal
 */
export function getDatetimeAverage(...ab: [DateTime, DateTime]): DateTime {
  if (ab[0].equals(ab[1])) { return ab[0] } // Early exit
  // Make sure a is always the smaller value
  const [a, b] = ab.sort()
  const diff = b.diff(a).as('seconds')
  const padding = diff / 2
  return a.plus(Duration.fromObject({ seconds: padding }))
}
