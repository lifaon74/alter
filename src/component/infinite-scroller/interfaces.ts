import { AttributeChangedCallback, ConnectedCallBack, DisconnectedCallBack } from '../custom-element/interfaces';

export type TInfiniteScrollerDirection = 'vertical' | 'horizontal';

export type IInfiniteScrollerContentLimitStrategy = 'ignore' | 'pause' | 'stop';




export interface IInfiniteScroller extends HTMLElement, ConnectedCallBack, DisconnectedCallBack, AttributeChangedCallback {
  direction: TInfiniteScrollerDirection;
  loadDistance: number;
  unloadDistance: number;

  contentLimitWheelStrategy: IInfiniteScrollerContentLimitStrategy;
  contentLimitTouchMoveStrategy: IInfiniteScrollerContentLimitStrategy;
  contentLimitTouchInertiaStrategy: IInfiniteScrollerContentLimitStrategy;
  contentLimitMouseMiddleStrategy: IInfiniteScrollerContentLimitStrategy;

  readonly firstElement: HTMLElement | null;
  readonly lastElement: HTMLElement | null;

  elements(reversed?: boolean): IterableIterator<HTMLElement>;
  appendBefore(elements: HTMLElement[]): Promise<void>;
  appendAfter(elements: HTMLElement[]): Promise<void>;
  clearElements(): void;
}
