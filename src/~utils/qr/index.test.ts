import { Field } from '~constants'
import { IDeviceKeyQR, __reviver__ } from '.'
import { DateTime } from 'luxon'
import { isObject } from '@glyph-cat/swiss-army-knife'

describe(__reviver__.name, () => {

  test('Main', () => {
    const now = DateTime.now()
    const obj = JSON.stringify({
      [Field.cTime]: now,
      [Field.deviceKey]: 'abc123',
    })
    const output = JSON.parse(obj, __reviver__) as IDeviceKeyQR
    expect(isObject(output)).toBe(true)
    expect(Object.keys(output).length).toBe(2)
    expect(output[Field.cTime].toObject()).toStrictEqual(now.toObject())
    expect(output[Field.deviceKey]).toBe('abc123')
  })

})
