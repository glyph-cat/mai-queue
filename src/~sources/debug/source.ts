import { RelinkSource } from 'react-relink'
import { IDebugConfig } from './abstractions'

export const DebugConfigSource = new RelinkSource<IDebugConfig>({
  key: 'debug-config',
  default: {
    disableGeoChecking: false,
  },
})
