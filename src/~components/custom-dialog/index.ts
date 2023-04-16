import { Nullable } from '@glyph-cat/swiss-army-knife'
import { ReactNode } from 'react'
import { CUSTOM_DIALOG_CANCEL_VALUE, CustomDialogCancellableValue } from './abstractions'
import { CustomDialogChoiceComponent, ChoiceItem } from './choice'
import { BaseDialogSize } from './components'
import { CustomDialogFreeform, CustomDialogFreeformArgs } from './freeform'
import { getCancelText, getOkText } from './text'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CustomDialog {

  export interface AlertOptions {
    okText?: string
    dialogSize?: BaseDialogSize
    highPriority?: boolean
  }

  export async function alert(
    title: ReactNode,
    description?: ReactNode,
    options: AlertOptions = {}
  ): Promise<void> {
    const {
      okText,
      dialogSize = BaseDialogSize.default,
      highPriority,
    } = options
    await choice(title, description, {
      data: [{
        label: getOkText(okText),
        type: 'primary',
      }],
      dialogSize,
      highPriority,
    })
  }

  export interface ConfirmOptions {
    okText?: string
    cancelText?: string
    destructive?: boolean
    dialogSize?: BaseDialogSize
    highPriority?: boolean
  }

  export async function confirm(
    title: string,
    description?: ReactNode,
    options: ConfirmOptions = {}
  ): Promise<boolean> {
    const {
      cancelText,
      destructive,
      okText,
      dialogSize = BaseDialogSize.default,
      highPriority,
    } = options
    const response = await choice(title, description, {
      data: [
        {
          label: getOkText(okText),
          type: destructive ? 'destructive' : 'primary',
          value: true,
        },
        {
          label: getCancelText(cancelText),
        },
      ],
      dialogSize,
      highPriority,
    })
    return !Object.is(response, CUSTOM_DIALOG_CANCEL_VALUE)
  }

  export interface ChoiceOptions<Response> {
    data: Array<ChoiceItem<Response>>
    dialogSize?: BaseDialogSize
    highPriority?: boolean
  }

  export async function choice<Response>(
    title: ReactNode,
    description: Nullable<ReactNode>,
    options: ChoiceOptions<Response>
  ): Promise<CustomDialogCancellableValue<Response>> {
    const {
      data,
      dialogSize = BaseDialogSize.default,
      highPriority,
    } = options
    const response = await CustomDialogFreeform({
      title,
      description,
      component: CustomDialogChoiceComponent,
      props: {
        data,
      },
      dialogSize,
      highPriority,
    })
    return response
  }

  export type FreeformArgs<Props> = CustomDialogFreeformArgs<Props>

  export const freeform = CustomDialogFreeform

}
