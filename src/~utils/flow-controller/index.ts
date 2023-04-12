// About JavaScript Maps
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

/**
 * Coordinates asynchronous functions so that they do not race against each
 * other.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createFlowController<T = void>() {
  // NOTE: Adapted from this Stack Overflow answer:
  // https://stackoverflow.com/a/53540586/5810737
  const pendingMap: Map<string, Promise<T>> = new Map()
  function flow(
    flowKey: string,
    asyncCallback: () => Promise<T>
  ): Promise<T> {
    const run = async (): Promise<T> => {
      if (pendingMap.has(flowKey)) {
        await pendingMap.get(flowKey)
      }
      return asyncCallback()
    }
    pendingMap.set(flowKey, run())
    return pendingMap.get(flowKey)
  }
  return flow
}

// (1)                       (2)
// There can be many async   They are distributed
// functions waiting to be   by path and executed
// executed                  one by one
//
//                           \_____/ Path A
//                    _>       ···
// fn() fn()        _/       /⎺⎺⎺⎺⎺\
//   fn()         _/
// fn() fn()    _/
//   fn()                    \_____/ Path B
// fn() fn()    -------->      ···
//   fn()                    /⎺⎺⎺⎺⎺\
// fn() fn()    ⎺\
//   fn()         ⎺\
//   ...            ⎺\       \_____/ Path C
//                    ⎺>       ···
//                           /⎺⎺⎺⎺⎺\
//
// (3) Functions targeting different paths can run in
// parallel but those targeting same paths will be queued.


// NOTE: Tried to do `let pending: Promise<T> = Promise.resolve()` but will
// receive a TS error:
// > Type 'Promise<void>' is not assignable to type 'Promise<T>'.
// > Type 'void' is not assignable to type 'T'.
// > 'T' could be instantiated with an arbitrary type which could be unrelated
// > to 'void'.ts(2322)
// Then I figured it might be because I am trying to assign a value to a
// dynamic type. (See: https://stackoverflow.com/a/59363875/5810737) 8 May 2021
// As `Promise.resolve()` returns `Promise<void>`, it is not guaranteed that
// `pending` will be assigned with `Promise<C>` before it reaches the return
// statement. Just a vague guess, but anyway, now errors no longer show up
// using the method below.
