import { useLayoutEffect, useRef } from '@glyph-cat/swiss-army-knife'
import { ResizeSensor } from 'css-element-queries'
import { useState } from 'react'

export interface SizeMeasurement {
  height: number
  width: number
}

export function useResizeSensor(divElement: HTMLDivElement): SizeMeasurement {
  const resizeSensor = useRef<ResizeSensor>()
  const [size, setSize] = useState<SizeMeasurement>({ height: 0, width: 0 })
  useLayoutEffect(() => {
    if (!divElement) { return } // Early exit
    resizeSensor.current = new ResizeSensor(divElement, (newSize) => {
      setSize(newSize)
    })
    return () => { resizeSensor.current.detach() }
  }, [divElement])
  return size
}
