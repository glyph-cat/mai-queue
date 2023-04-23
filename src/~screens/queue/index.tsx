import { isNull, useRef, useWindowDimensions } from '@glyph-cat/swiss-army-knife'
import { useCallback, useEffect, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { IQueueTicket, QueueViewMode } from '~abstractions'
import { LoadingCover } from '~components/loading-cover'
import { ReplacementFixedSizeList } from '~components/react-window-replacement'
import { useCurrentQueueConsumer } from '~services/queue-watcher/current'
import { usePastQueueConsumer } from '~services/queue-watcher/past'
import { ConfigSource } from '~sources/config'
import { BottomSheet } from './components/bottom-sheet'
import { EmptyListComponent } from './components/empty-list-component'
import { ListItem, ListItemPropData } from './components/list-item'
import { ListLoadingComponent } from './components/list-loading-component'
import { ViewModeTabs } from './components/view-mode-tabs'
import { useDeviceKeyValidation } from './hooks/use-device-key-validation'
import styles from './index.module.css'

function keyExtractor(index: number, data: ListItemPropData): string {
  return data.get(index).id
}

function QueueScreen(): JSX.Element {

  const [viewMode, setViewMode] = useState<QueueViewMode>(QueueViewMode.CURRENT)

  const listRef = useRef<ReplacementFixedSizeList>()

  const configState = useRelinkValue(ConfigSource)
  const windowDimensions = useWindowDimensions()
  const isDeviceKeyValidationComplete = useDeviceKeyValidation(configState.deviceKey)

  // Idle at first, then keep alive as long as the screen is mounted
  const [isPastQueueRequested, setPastQueueRequestFlag] = useState(false)
  useEffect(() => {
    if (viewMode === QueueViewMode.PAST) {
      setPastQueueRequestFlag(true)
    }
  }, [viewMode])
  const currentQueue = useCurrentQueueConsumer()
  const pastQueue = usePastQueueConsumer(null, isPastQueueRequested)

  const listToUse = viewMode === QueueViewMode.CURRENT
    ? currentQueue.data
    : pastQueue.data

  const listIsLoading = (() => {
    if (viewMode === QueueViewMode.CURRENT) {
      return isNull(currentQueue.lastFetched)
    } else if (viewMode === QueueViewMode.PAST) {
      return isNull(pastQueue.lastFetched)
    }
  })()

  const onScrollToTicketInList = useCallback((ticketId: string) => {
    listRef.current.scrollToItem(ticketId)
  }, [])

  return (
    <>
      <div className={styles.container}>
        <ViewModeTabs
          value={viewMode}
          onChange={setViewMode}
        />
        <ReplacementFixedSizeList
          ref={listRef}
          height={windowDimensions.height}
          itemSize={160}
          itemCount={listToUse.length}
          children={ListItem} // eslint-disable-line react/no-children-prop
          width='100%'
          itemKey={keyExtractor}
          itemData={{
            get(index: number): IQueueTicket {
              return { ...listToUse[index] }
            },
            deviceKey: configState.deviceKey,
            loading: listIsLoading,
          }}
          emptyListComponent={useCallback(() => {
            return <EmptyListComponent viewMode={viewMode} />
          }, [viewMode])}
          loadingComponent={ListLoadingComponent}
          loading={listIsLoading}
        />
      </div>
      <BottomSheet
        onScrollToTicketInList={onScrollToTicketInList}
      />
      <LoadingCover visible={!isDeviceKeyValidationComplete} />
    </>
  )
}

export default QueueScreen
