import { createFlowController } from '.'

describe('Flow Controller', () => {

  jest.useRealTimers()
  const flow = createFlowController<string | void>()

  test('Flows in correct order', () => {

    const textStack = []

    let counterA = 0
    const asyncFunctionA = async () => {
      const currentChar = `A${++counterA}`
      textStack.push(currentChar)
    }

    let counterB = 0
    const asyncFunctionB = (): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentChar = `B${++counterB}`
          textStack.push(currentChar)
          resolve(undefined)
        }, 250)
      })
    }

    return new Promise((resolve) => {
      flow('path-a', asyncFunctionA)
      flow('path-b', asyncFunctionB)
      flow('path-a', asyncFunctionA)
      flow('path-b', asyncFunctionB)
      setTimeout(() => {
        // All A functions will be called first because
        // B has 250ms delay.
        // Same path       -> queued
        // Different paths -> can run in parallel
        expect(textStack).toStrictEqual(['A1', 'A2', 'B1', 'B2'])
        resolve(undefined)
      }, 750)
    })

  })

  test('Values are forwarded', () => {
    return new Promise((resolve) => {
      flow('path', async () => 'hello').then((value) => {
        expect(value).toBe('hello')
        resolve(undefined)
      })
    })
  })

})
