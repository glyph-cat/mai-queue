import { useLayoutEffect } from '@glyph-cat/swiss-army-knife'
import { ENV } from '~constants'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

export type VersionNumberProps = Omit<DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>, HTMLSpanElement
>, 'children'>

export function useVersioningMetadata(): void {
  useLayoutEffect(() => {
    const UNAVAILABLE = '(Unavailable)'
    const jsonString = JSON.stringify({
      hash: ENV.GIT_COMMIT_SHA || UNAVAILABLE,
      version: ENV.APP_VERSION || UNAVAILABLE,
    }, null, 2)
    // Add spaces around the string for tidyness so that we can get
    // <!-- {...} --> instead of <!--{...}-->
    const htmlComment = document.createComment(` ${jsonString} `)
    document.appendChild(htmlComment)
    return () => { htmlComment.remove() }
  }, [])
}
