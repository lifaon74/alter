import {
  AttributeChangedCallback, ConnectedCallBack, DisconnectedCallBack
} from '../../../core/component/custom-element/implements';
import { ILoadElementsEvent } from './events/load-elements-event/interfaces';
import { IUnloadElementsEvent } from './events/unload-elements-event/interfaces';
import { ICancellablePromise, ICancellablePromiseOptions } from '@lifaon/observables';

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

export interface IElementsIteratorOptions {
  after?: HTMLElement | null;
  includeAfter?: boolean;
  reversed?: boolean;
}

export interface IElementsIteratorNormalizedOptions extends Required<IElementsIteratorOptions> {
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
  contentLimitStrategy: IInfiniteScrollerContentLimitStrategy | null;

  readonly firstElement: HTMLElement | null; // first child element in the list of elements of this infinite scroller
  readonly lastElement: HTMLElement | null; // last child element in the list of elements of this infinite scroller

  getFirstVisibleElement(options?: IElementsIteratorOptions): HTMLElement | null;


  /**
   * Returns the list of child elements (as an iterable) present in this infinite scroller
   */
  elements(options?: IElementsIteratorOptions): IterableIterator<HTMLElement>;

  /**
   * Asks to this infinite scroller to append 'elements' before all other child elements
   * Returns a promise, resolved when theses elements would be loaded in the DOM
   */
  appendBefore(elements: HTMLElement[], options?: ICancellablePromiseOptions): ICancellablePromise<void>;

  /**
   * Asks to this infinite scroller to append 'elements' after all other child elements
   * Returns a promise, resolved when theses elements would be loaded in the DOM
   */
  appendAfter(elements: HTMLElement[], options?: ICancellablePromiseOptions): ICancellablePromise<void>;


  /**
   * Removes all elements in this infinite scroller and emits a 'clear' event
   */
  replaceElements(chunks: HTMLElement[][]): void;

  applyTranslation(translation: number, immediate?: boolean): void;

  addEventListener<K extends keyof IInfiniteScrollerEventMap>(type: K, listener: (this: HTMLElement, ev: IInfiniteScrollerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;

  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}
