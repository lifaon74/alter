import {
  AttributeChangedCallback, ConnectedCallBack, DisconnectedCallBack
} from '../../../core/component/custom-element/implements';
import { ILoadElementsEvent } from './events/load-elements-event/interfaces';
import { IUnloadElementsEvent } from './events/unload-elements-event/interfaces';

/** TYPES **/

export type TInfiniteScrollerDirection = 'vertical' | 'horizontal';

export type IInfiniteScrollerContentLimitStrategy = 'ignore' | 'pause' | 'stop';

export interface IInfiniteScrollerEventMap extends HTMLElementEventMap {
  'load-after': ILoadElementsEvent;
  'load-before': ILoadElementsEvent;
  'unload-after': IUnloadElementsEvent;
  'unload-before': IUnloadElementsEvent;
  'clear': IUnloadElementsEvent;
}

/** INTERFACES **/

export interface IInfiniteScroller extends HTMLElement, ConnectedCallBack, DisconnectedCallBack, AttributeChangedCallback {
  direction: TInfiniteScrollerDirection; // scrolling direction
  loadDistance: number;
  unloadDistance: number;

  contentLimitWheelStrategy: IInfiniteScrollerContentLimitStrategy;
  contentLimitTouchMoveStrategy: IInfiniteScrollerContentLimitStrategy;
  contentLimitTouchInertiaStrategy: IInfiniteScrollerContentLimitStrategy;
  contentLimitMouseMiddleStrategy: IInfiniteScrollerContentLimitStrategy;

  readonly firstElement: HTMLElement | null; // first element in the list of elements of this infinite scroller
  readonly lastElement: HTMLElement | null; // last element in the list of elements of this infinite scroller

  /**
   * Returns the list of elements (as an iterable) present in this infinite scroller
   */
  elements(reversed?: boolean): IterableIterator<HTMLElement>;

  /**
   * Appends 'elements' before all other elements in this infinite scroller
   * // TODO infer wehn resolved
   */
  appendBefore(elements: HTMLElement[]): Promise<void>;
  appendAfter(elements: HTMLElement[]): Promise<void>;


  /**
   * Removes all elements in this infinite scroller and emits a 'clear' event
   */
  clearElements(): void;
}
