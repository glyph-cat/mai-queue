export interface ConsumableThemeData {
  palette: {
    fixedBlack: string
    fixedWhite: string
    fixedRed: string
    basicBg: string
    footerBg: string
    neutralFill: string
    paleOrange: string
    primaryOrange: string
    dangerRed: string
    safeGreen: string
    acidColor: string
  }
}

const palette: ConsumableThemeData['palette'] = {
  fixedBlack: '#000000',
  fixedWhite: '#ffffff',
  fixedRed: '#ff0000',
  basicBg: '#51bcf3',
  footerBg: '#55ab47',
  neutralFill: '#8b9fad',
  paleOrange: '#ffa040',
  primaryOrange: '#ed702d',
  dangerRed: '#ff2a00',
  safeGreen: '#40A020',
  acidColor: '#979c14',
}

export function useTheme(): ConsumableThemeData {
  return {
    palette,
  }
}
