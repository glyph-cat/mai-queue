import { delay } from '@glyph-cat/swiss-army-knife'
import { RelinkSource } from 'react-relink'
import { ANIMATED_BACKDROP_TRANSITION_DURATION } from '~constants'
import { APIRequestDeviceKey } from '~services/api/device/request-key'
import { ConfigSource } from '~sources/config'

export enum StepIndex {
  CONFIG = 1,
  TAKE_TICKET,
  SET_FRIEND_CODE,
  // Steps that are unreachable by arrow buttons are placed below
  SHOW_QR,
  SHOW_CAMERA,
}

export const MIN_VISIBLE_STEP_INDEX = StepIndex.CONFIG
export const MAX_VISIBLE_STEP_INDEX = StepIndex.SET_FRIEND_CODE

export interface IStepWizard {
  step: StepIndex
  shouldMountAnimatedBackdrop: boolean
  shouldShowBottomSheet: boolean
}

export const StepWizardSource = new RelinkSource<IStepWizard>({
  key: 'step',
  default: {
    step: StepIndex.TAKE_TICKET,
    shouldMountAnimatedBackdrop: false,
    shouldShowBottomSheet: false,
  },
})

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace StepWizard {

  export async function showBottomSheet(): Promise<void> {
    await StepWizardSource.set((s) => ({
      ...s,
      shouldShowBottomSheet: true,
      shouldMountAnimatedBackdrop: true,
    }))
  }

  export async function hideBottomSheet(): Promise<void> {
    await StepWizardSource.set({
      ...StepWizardSource.default,
      shouldMountAnimatedBackdrop: true, // preserve for animation
    })
    await delay(ANIMATED_BACKDROP_TRANSITION_DURATION)
    await StepWizardSource.reset()
  }

  export async function stepBackward(): Promise<void> {
    await StepWizardSource.set((s) => ({
      ...s,
      step: Math.max(MIN_VISIBLE_STEP_INDEX, s.step - 1),
    }))
  }

  export async function stepForward(): Promise<void> {
    await StepWizardSource.set((s) => ({
      ...s,
      step: Math.min(s.step + 1, MAX_VISIBLE_STEP_INDEX),
    }))
  }

  export function isSteppable(step: StepIndex): boolean {
    return step >= MIN_VISIBLE_STEP_INDEX && step <= MAX_VISIBLE_STEP_INDEX
  }

  export async function showQR(): Promise<void> {
    await StepWizardSource.set((s) => ({ ...s, step: StepIndex.SHOW_QR }))
    const { deviceKey } = await ConfigSource.getAsync()
    if (!deviceKey) {
      const newDeviceKey = await APIRequestDeviceKey()
      await ConfigSource.set((s) => ({ ...s, deviceKey: newDeviceKey }))
    }
  }

  export async function showCamera(): Promise<void> {
    await StepWizardSource.set((s) => ({ ...s, step: StepIndex.SHOW_CAMERA }))
  }

  export async function returnToTicketSection(): Promise<void> {
    await StepWizardSource.set((s) => ({ ...s, step: StepIndex.TAKE_TICKET }))
  }

}
