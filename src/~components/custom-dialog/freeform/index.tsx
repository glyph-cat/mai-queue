import {
  JSFunction,
  removeFromPortal,
  renderInPortal,
} from '@glyph-cat/swiss-army-knife'
import {
  ComponentClass,
  FunctionComponent,
  MutableRefObject,
  ReactNode,
  createContext,
  useContext,
} from 'react'
import { ANIMATED_BACKDROP_TRANSITION_DURATION } from '~constants'
import { devError } from '~utils/dev'
import { CUSTOM_DIALOG_CANCEL_VALUE, CustomDialogCancellableValue } from '../abstractions'
import {
  BaseDialog,
  BaseDialogSize,
} from '../components'
import { flow } from '../flow-control'

export interface ICustomDialogFreeformContext<Response> {
  cancel(): void
  submit(value: Response): void
}

const CustomDialogFreeformContext = createContext<ICustomDialogFreeformContext<unknown>>({
  cancel(): void {
    devError('Attempted to call `cancel` from outside a `CustomDialogFreeformContext`')
  },
  submit(): void {
    devError('Attempted to call `submit` from outside a `CustomDialogFreeformContext`')
  },
})

export function useCustomDialogFreeformContext<Response>(): ICustomDialogFreeformContext<Response> {
  return useContext(CustomDialogFreeformContext)
}

export interface CustomDialogFreeformArgs<Props> {
  title?: ReactNode,
  description?: ReactNode,
  component: FunctionComponent<Props> | ComponentClass<Props>
  props?: Props
  dialogSize?: BaseDialogSize
  /**
   * @defaultValue `false`
   */
  highPriority?: boolean
  /**
   * @defaultValue `false`
   */
  easyDismiss?: boolean
}

export async function CustomDialogFreeform<Props, Response>(
  args: CustomDialogFreeformArgs<Props>
): Promise<CustomDialogCancellableValue<Response>> {
  const {
    title,
    description,
    component: Component,
    props,
    highPriority,
    easyDismiss,
  } = args
  const executor = (): Promise<CustomDialogCancellableValue<Response>> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const componentRef: MutableRefObject<BaseDialog> = { current: null }
      const onDismissRef: MutableRefObject<JSFunction> = { current: null }
      const portalId = await renderInPortal(BaseDialog, (() => {
        onDismissRef.current = async () => {
          await componentRef.current.hide()
          removeFromPortal(portalId)
          resolve(CUSTOM_DIALOG_CANCEL_VALUE)
        }
        return {
          title,
          description,
          ref: componentRef,
          onDismiss: onDismissRef.current,
          easyDismiss,
        }
      })(), (
        <CustomDialogFreeformContext.Provider
          value={{
            cancel: onDismissRef.current,
            submit(value: Response): void {
              componentRef.current.hide()
              setTimeout(() => {
                removeFromPortal(portalId)
                resolve(value)
              }, ANIMATED_BACKDROP_TRANSITION_DURATION)
            },
          }}
        >
          <Component {...props} />
        </CustomDialogFreeformContext.Provider>
      ))
    })
  }

  return highPriority ? executor() : flow(executor)
}

