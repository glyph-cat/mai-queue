import { RelinkSource } from 'react-relink'

export interface IUnstableSource {
  isRetrievingPlayerInfo: boolean
}

export const UnstableSource = new RelinkSource<IUnstableSource>({
  key: 'unstable',
  default: {
    isRetrievingPlayerInfo: false,
  },
})
