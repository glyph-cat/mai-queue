import { isString } from '@glyph-cat/swiss-army-knife'
import { useRouter } from 'next/router'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { ARCADE_LIST } from './list'
import { ArcadeInfo } from './abstractions'

const ArcadeInfoContext = createContext<ArcadeInfo>(null)

const STORAGE_KEY = 'arcade-id'

export interface ArcadeInfoProviderProps {
  children: ReactNode | Array<ReactNode>
}

export function ArcadeInfoProvider({
  children,
}: ArcadeInfoProviderProps): JSX.Element {

  const { query: { a } = {} } = useRouter()

  const arcadeId = useMemo(() => {
    if (isString(a) && ARCADE_LIST[a]) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(a))
      }
      return a
    } else {
      if (typeof window !== 'undefined') {
        const persistedArcadeId = localStorage.getItem(STORAGE_KEY)
        if (persistedArcadeId) {
          return persistedArcadeId
        }
      }
    }
    return null
  }, [a])

  const fullArcadeInfo = useMemo(() => ({
    ...ARCADE_LIST[arcadeId],
    id: arcadeId,
  }), [arcadeId])

  return (
    <ArcadeInfoContext.Provider value={fullArcadeInfo}>
      {children}
    </ArcadeInfoContext.Provider>
  )
}

export function useArcadeInfo(): ArcadeInfo {
  return useContext(ArcadeInfoContext)
}

export * from './list'
export * from './abstractions'

