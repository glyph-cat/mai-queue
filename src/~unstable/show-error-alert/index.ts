import { Nullable, tryOnly } from '@glyph-cat/swiss-army-knife'
import { AxiosError, CanceledError } from 'axios'
import { CustomDialog } from '~components/custom-dialog'
import { CustomAPIError } from '~errors'
import { devError } from '~utils/dev'

// TODO: [High priority] What error do we get when no internet? How do we know? and what do we show?
// May be can do something in '~utils/network'

export async function handleClientError(
  error: Error,
  extraMessage?: string
): Promise<void> {
  devError(error)
  if (error instanceof AxiosError) {
    if (!(error instanceof CanceledError)) {
      const code = Number(error.response?.data?.code || -1)
      const message = Nullable(error.response?.data?.message)
      if (code > 0) {
        await CustomDialog.alert(message, `Error (code:${code})`)
      } else {
        await CustomDialog.alert(error.message)
      }
    }
  } else if (error instanceof CustomAPIError) {
    // We need this because of `SetFriendCodeAlt`
    await CustomDialog.alert(error.message, `Error (code:${error.code})`)
  } else if (error instanceof Error) {
    await CustomDialog.alert(error.name, error.message + (extraMessage ? `\n\n${extraMessage}` : ''))
  } else {
    let jsonContent: string
    tryOnly(() => { jsonContent = JSON.stringify(error) })
    if (jsonContent && jsonContent !== '{}') {
      await CustomDialog.alert('Unknown error', jsonContent)
    } else {
      await CustomDialog.alert('Unknown error', String(error))
    }
  }
}
