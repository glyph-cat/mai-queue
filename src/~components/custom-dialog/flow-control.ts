import { createFlowController } from '~utils/flow-controller'

// NOTE: The `CustomDialog` methods are wrapped in a flow controller to prevent
// race conditions, even without await. Just in case components from different
// code try to show a dialog at the same time, one will be shown while the rest
// are queued.
const CustomDialogFlowController = createFlowController()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flow(asyncCallback: (() => Promise<any>)): Promise<any> {
  return CustomDialogFlowController('CD', asyncCallback)
}
