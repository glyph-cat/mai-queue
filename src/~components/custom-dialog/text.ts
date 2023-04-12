// import { LocalizationCore } from '~localizations'

export function getOkText(value: string): string {
  return value ? value : 'OK'
  // return value ? value : LocalizationCore.localize('OK')
}

export function getCancelText(value: string): string {
  return value ? value : 'CANCEL'
  // return value ? value : LocalizationCore.localize('CANCEL')
}
