import {
  AttributeChangedCallback, ConnectedCallBack, DisconnectedCallBack
} from '../../../core/component/custom-element/implements';
import { ILoadElementsEvent } from './events/load-elements-event/interfaces';
import { IUnloadElementsEvent } from './events/unload-elements-event/interfaces';

/** TYPES **/

export type TInfiniteScrollerDirection = 'vertical' | 'horizontal';

export type IInfiniteScrollerContentLimitStrategy = 'ignore' | 'pause' | 'stop';

export interface IInfiniteScrollerMap extends HTMLElementEventMap {
  'load-after': ILoadElementsEvent;
  'load-before': ILoadElementsEvent;
  'unload-after': IUnloadElementsEvent;
  'unload-before': IUnloadElementsEvent;
  'clear': IUnloadElementsEvent;
}

/** INTERFACES **/

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
