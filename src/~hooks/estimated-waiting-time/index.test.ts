import { DateTime } from 'luxon'
import { InternalClientError } from '~errors'
import {
  getAggregatedAverage,
  getDatetimeAverage,
  getEstimatedWaitingTime,
  mapXtimeStackToLastNClosedTicketsWithAutofill,
} from '.'
import { IQueueTicket } from '~abstractions'

function sqlTime(hhmmss: string): string {
  return `2023-02-01 ${hhmmss}.000 +08:00`
}

function time(hhmmss: string): DateTime {
  return DateTime.fromSQL(sqlTime(hhmmss))
}

describe(getDatetimeAverage.name, () => {

  test('Same values', () => {
    const output = getDatetimeAverage(time('10:00:00'), time('10:00:00'))
    expect(output.toSQL()).toBe(sqlTime('10:00:00'))
  })

  test('Different values', () => {
    const a = time('10:00:00')
    const b = time('11:00:00')
    const output = getDatetimeAverage(a, b)
    expect(output.toSQL()).toBe(sqlTime('10:30:00'))
    expect(a.toSQL()).toBe(sqlTime('10:00:00'))
    // ^ Also expect the original value to be not tampered with
  })

})

describe(getAggregatedAverage.name, () => {

  describe('Happy paths ("**-**-**")', () => {

    test('All dates are in perfect order', () => {
      const output = getAggregatedAverage(3, [
        time('10:00:00'),
        time('10:00:00'),
        time('10:15:00'),
        time('10:15:00'),
        time('10:30:00'),
        time('10:30:00'),
      ])
      expect(output.length).toBe(3)
      expect(output[0].toSQL()).toBe(sqlTime('10:00:00'))
      expect(output[1].toSQL()).toBe(sqlTime('10:15:00'))
      expect(output[2].toSQL()).toBe(sqlTime('10:30:00'))
    })

    test('Dates are "humanized", therefore requires averaging', () => {
      const output = getAggregatedAverage(3, [
        time('10:03:00'),
        time('10:03:50'),
        time('10:10:30'),
        time('10:11:30'),
        time('10:12:00'),
        time('10:12:02'),
      ])
      expect(output.length).toBe(3)
      expect(output[0].toSQL()).toBe(sqlTime('10:03:25'))
      expect(output[1].toSQL()).toBe(sqlTime('10:11:00'))
      expect(output[2].toSQL()).toBe(sqlTime('10:12:01'))
    })

  })

  describe('Array consists of "stray" timestamps', () => {

    test('*-*-**-**"', () => {
      const output = getAggregatedAverage(3, [
        time('10:00:00'),
        time('10:03:50'),
        time('10:10:30'),
        time('10:11:30'),
        time('10:12:00'),
        time('10:12:02'),
      ])
      expect(output.length).toBe(4)
      expect(output[0].toSQL()).toBe(sqlTime('10:00:00'))
      expect(output[1].toSQL()).toBe(sqlTime('10:03:50'))
      expect(output[2].toSQL()).toBe(sqlTime('10:11:00'))
      expect(output[3].toSQL()).toBe(sqlTime('10:12:01'))
    })

    test('**-*-*-**"', () => {
      const output = getAggregatedAverage(3, [
        time('10:03:00'),
        time('10:03:50'),
        time('10:10:30'),
        time('10:15:21'),
        time('10:20:34'),
        time('10:21:56'),
      ])
      expect(output.length).toBe(4)
      expect(output[0].toSQL()).toBe(sqlTime('10:03:25'))
      expect(output[1].toSQL()).toBe(sqlTime('10:10:30'))
      expect(output[2].toSQL()).toBe(sqlTime('10:15:21'))
      expect(output[3].toSQL()).toBe(sqlTime('10:21:15'))// 82/2, 34+41=75
    })

  })

  test('Not enough Datetime samples', () => {
    const callback = () => { getAggregatedAverage(3, new Array(5)) }
    expect(callback).toThrowError(new InternalClientError('X1-3,6,5'))
  })

})

describe(mapXtimeStackToLastNClosedTicketsWithAutofill.name, () => {

  test('Enough samples', () => {
    const lastPlayedTickets = [
      { xTime: time('11:00:00') },
      { xTime: time('11:00:00') },
      { xTime: time('11:05:00') },
      { xTime: time('11:05:00') },
      { xTime: time('11:10:00') },
      { xTime: time('11:10:00') },
    ] as Array<IQueueTicket>
    const cabinetCount = 3
    const currentDatetime = time('11:10:00')
    const output = mapXtimeStackToLastNClosedTicketsWithAutofill(
      lastPlayedTickets,
      cabinetCount,
      currentDatetime
    )
    expect(output.length).toBe(6)
    expect(output[0].toSQL()).toBe(sqlTime('11:00:00'))
    expect(output[1].toSQL()).toBe(sqlTime('11:00:00'))
    expect(output[2].toSQL()).toBe(sqlTime('11:05:00'))
    expect(output[3].toSQL()).toBe(sqlTime('11:05:00'))
    expect(output[4].toSQL()).toBe(sqlTime('11:10:00'))
    expect(output[5].toSQL()).toBe(sqlTime('11:10:00'))
  })

  test('Not enough samples', () => {
    const lastPlayedTickets = [
      { xTime: time('11:00:00') },
      { xTime: time('11:00:00') },
      { xTime: time('11:05:00') },
      { xTime: time('11:05:00') },
    ] as Array<IQueueTicket>
    const cabinetCount = 3
    const currentDatetime = time('11:10:00')
    const output = mapXtimeStackToLastNClosedTicketsWithAutofill(
      lastPlayedTickets,
      cabinetCount,
      currentDatetime
    )
    expect(output.length).toBe(6)
    expect(output[0].toSQL()).toBe(sqlTime('10:55:00'))
    expect(output[1].toSQL()).toBe(sqlTime('10:55:00'))
    expect(output[2].toSQL()).toBe(sqlTime('11:00:00'))
    expect(output[3].toSQL()).toBe(sqlTime('11:00:00'))
    expect(output[4].toSQL()).toBe(sqlTime('11:05:00'))
    expect(output[5].toSQL()).toBe(sqlTime('11:05:00'))
  })

})

describe(getEstimatedWaitingTime.name, () => {

  describe('cabinetCount = 1', () => {
    const lastPlayedTickets = [
      { xTime: time('11:00:00') },
      { xTime: time('11:00:10') },
    ] as Array<IQueueTicket>
    const cabinetCount = 1
    const currentDatetime = time('11:15:00')
    const expectations: Array<number> = [
      0, 0,
      15, 15,
      30, 30,
      45, 45,
      60, 60,
      75, 75,
    ]
    for (let i = 0; i < expectations.length; i++) {
      test(`i = ${i}`, () => {
        expect(getEstimatedWaitingTime(
          lastPlayedTickets, i, cabinetCount, currentDatetime
        )).toBe(expectations[i])
      })
    }
  })

  // TODO: [High priority]
  // To consider when testing
  // - cabinetCount
  // - Have enough samples?
  // - If have enough samples, are the time close to each other or contain stray patterns?
  // - Stress test: Not enough samples AND contain stray patterns

  describe('cabinetCount = 2', () => {
    const lastPlayedTickets = [
      { xTime: time('11:00:00') },
      { xTime: time('11:00:10') },
    ] as Array<IQueueTicket>
    const cabinetCount = 2
    const currentDatetime = time('11:15:00')
    const expectations: Array<number> = [
      0, 0, 0, 0,
      15, 15, 15, 15,
      30, 30, 30, 30,
      45,
    ]
    for (let i = 0; i < expectations.length; i++) {
      test(`i = ${i}`, () => {
        expect(getEstimatedWaitingTime(
          lastPlayedTickets, i, cabinetCount, currentDatetime
        )).toBe(expectations[i])
      })
    }
  })

})
