import { strictMerge } from '.'

describe(strictMerge.name, () => {

  test('Complete merge', () => {
    const defaultObject = { foo: 1, bar: 2 }
    const objectToMerge = { foo: 7, bar: 8 }
    const output = strictMerge(defaultObject, objectToMerge)
    expect(output).toStrictEqual({
      foo: 7,
      bar: 8,
    })
  })

  test('Partial merge', () => {
    const defaultObject = { foo: 1, bar: 2 }
    const objectToMerge = { bar: 8, baz: 9 }
    const output = strictMerge(defaultObject, objectToMerge)
    expect(output).toStrictEqual({
      foo: 1,
      bar: 8,
    })
  })

  test('No overlap', () => {
    const defaultObject = { foo: 1, bar: 2 }
    const objectToMerge = { baz: 9, abc: 0 }
    const output = strictMerge(defaultObject, objectToMerge)
    expect(output).toStrictEqual({
      foo: 1,
      bar: 2,
    })
  })

  test('Multiple objects', () => {
    const output = strictMerge(
      { a: 1, b: 2, c: 3, d: 4 },
      { a: 2 },
      { e: 5, f: 6 },
      { a: 3, c: 4, x: 0 },
    )
    expect(output).toStrictEqual({
      a: 3,
      b: 2,
      c: 4,
      d: 4,
    })
  })

})
