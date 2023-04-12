import {
  Component as ReactComponent,
  ComponentType,
  ReactNode,
  createRef,
  MutableRefObject,
} from 'react'
import { FixedSizeListProps } from 'react-window'

export interface ReplacementFixedSizeListProps extends FixedSizeListProps {
  emptyListComponent: ComponentType
  loadingComponent: ComponentType
  loading: boolean
}

export class ReplacementFixedSizeList extends ReactComponent<ReplacementFixedSizeListProps>{

  private containerRef = createRef<HTMLDivElement>()
  private keyPositionCache: Record<string, number> = {}
  private refCache: Record<string, MutableRefObject<HTMLDivElement>> = {}

  render(): ReactNode {

    const {
      height,
      itemSize,
      itemCount,
      children: RenderItem,
      itemKey,
      itemData,
      emptyListComponent: EmptyListComponent,
      width,
      loading,
      loadingComponent: LoadingComponent,
    } = this.props

    this.keyPositionCache = {}
    this.refCache = {}
    const renderStack = []
    // Higher items in the list will have higher z-index because they are
    // mounted after the lower items in the DOM tree
    for (let i = itemCount - 1; i >= 0; i--) {
      const key = itemKey(i, itemData)
      this.keyPositionCache[key] = i
      this.refCache[key] = createRef<HTMLDivElement>()
      renderStack.push(
        <div ref={this.refCache[key]} key={key}>
          <RenderItem
            index={i}
            style={{
              height: itemSize,
              position: 'absolute',
              top: itemSize * i,
              width,
            }}
            data={itemData}
          />
        </div>
      )
    }

    return (
      <div
        ref={this.containerRef}
        style={{
          height: itemSize * itemCount,
          minHeight: height,
          marginBottom: 10,
          position: 'relative',
          width,
        }}
      >
        {!loading && renderStack.length <= 0 ? <EmptyListComponent /> : renderStack}
        {loading && <LoadingComponent />}
      </div>
    )
  }

  scrollToItem(key: string): void {
    if (this.refCache[key]) {
      this.refCache[key].current?.scrollIntoView()
    }
  }

}
