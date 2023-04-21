import { useLayoutEffect, useRef } from '@glyph-cat/swiss-army-knife'
import { ResizeSensor } from 'css-element-queries'
import { useState, useTransition } from 'react'

export interface SizeMeasurement {
  height: number
  width: number
}

export function useResizeSensor(divElement: HTMLDivElement): SizeMeasurement {
  const resizeSensor = useRef<ResizeSensor>()
  const [size, setSize] = useState<SizeMeasurement>({ height: 0, width: 0 })
  const [, startTransition] = useTransition()
  useLayoutEffect(() => {
    if (!divElement) { return } // Early exit
    resizeSensor.current = new ResizeSensor(divElement, (newSize) => {
      startTransition(() => {
        setSize((previousSize) => {
          // NOTE: Width is not compared for now because it is not necessary
          if (newSize.height !== previousSize.height) {
            return newSize
          } else {
            return previousSize
          }
        })
      })
    })
    return () => { resizeSensor.current.detach() }
  }, [divElement])
  return size
}
