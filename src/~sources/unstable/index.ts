import { RelinkSource } from 'react-relink'

export interface IUnstableSource {
  isRetrievingPlayerInfo: boolean
  shouldShowArcadeInfoPopup: boolean
}

export const UnstableSource = new RelinkSource<IUnstableSource>({
  key: 'unstable',
  default: {
    isRetrievingPlayerInfo: false,
    shouldShowArcadeInfoPopup: false,
  },
})
