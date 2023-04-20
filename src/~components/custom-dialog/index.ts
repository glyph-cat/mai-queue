import { Nullable } from '@glyph-cat/swiss-army-knife'
import { ReactNode } from 'react'
import { CUSTOM_DIALOG_CANCEL_VALUE, CustomDialogCancellableValue } from './abstractions'
import { ChoiceItem, CustomDialogChoiceComponent } from './choice'
import { CustomDialogFreeform, CustomDialogFreeformArgs } from './freeform'
import { getCancelText, getOkText } from './text'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CustomDialog {

  export interface AlertOptions {
    okText?: string
    highPriority?: boolean
  }

  export async function alert(
    title: ReactNode,
    description?: ReactNode,
    options: AlertOptions = {}
  ): Promise<void> {
    const {
      okText,
      highPriority,
    } = options
    await choice(title, description, {
      data: [{
        label: getOkText(okText),
        type: 'primary',
      }],
      highPriority,
    })
  }

  export interface ConfirmOptions {
    okText?: string
    cancelText?: string
    destructive?: boolean
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
      highPriority,
    })
    return !Object.is(response, CUSTOM_DIALOG_CANCEL_VALUE)
  }

  export interface ChoiceOptions<Response> {
    data: Array<ChoiceItem<Response>>
    highPriority?: boolean
  }

  export async function choice<Response>(
    title: ReactNode,
    description: Nullable<ReactNode>,
    options: ChoiceOptions<Response>
  ): Promise<CustomDialogCancellableValue<Response>> {
    const {
      data,
      highPriority,
    } = options
    const response = await CustomDialogFreeform({
      title,
      description,
      component: CustomDialogChoiceComponent,
      props: {
        data,
      },
      highPriority,
    })
    return response
  }

  export type FreeformArgs<Props> = CustomDialogFreeformArgs<Props>

  export const freeform = CustomDialogFreeform

}
