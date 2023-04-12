import { RelinkSource } from 'react-relink'
import { IIncomingSwapRequestSource } from './abstractions'

const STORAGE_KEY = 'incoming-swap-request'

export const IncomingSwapRequestSource = new RelinkSource<IIncomingSwapRequestSource>({
  key: STORAGE_KEY,
  default: null,
})
