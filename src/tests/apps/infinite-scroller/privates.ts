import { INotificationsObserver } from '@lifaon/observables';
import { IInfiniteScroller, IInfiniteScrollerContentLimitStrategy, TInfiniteScrollerDirection } from './interfaces';
import { CyclicTypedVectorArray } from '../../../classes/cyclic/CyclicTypedVectorArray';

/** PRIVATES **/

export const INFINITE_SCROLLER_PRIVATE = Symbol('infinite-scroller-private');

export type TAnimationFunction = (time: number) => number;

export interface IInfiniteScrollerContentLimitStrategies {
  wheel: IInfiniteScrollerContentLimitStrategy;
  touchMove: IInfiniteScrollerContentLimitStrategy;
  touchInertia: IInfiniteScrollerContentLimitStrategy;
  mouseMiddle: IInfiniteScrollerContentLimitStrategy;
}

export interface IDeferredPromise<T> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

// export interface IDeferredAbortablePromise<T> extends IDeferredPromise<T> {
//   abort: (reason?: any) => void;
// }

export interface IInfiniteScrollerDeferredAppendList extends IDeferredPromise<void> {
  elements: HTMLElement[];
}

export interface IInfiniteScrollerDeferredClear extends IDeferredPromise<void> {
}

export interface IInfiniteScrollerOptionsPrivate {
  direction: TInfiniteScrollerDirection;
  loadDistance: number;
  unloadDistance: number;
  contentLimitStrategies: IInfiniteScrollerContentLimitStrategies;
}

export interface IInfiniteScrollerContainerPrivate {
  container: HTMLDivElement;
  containerStyle: CSSStyleDeclaration;
  transformMatrix: Float64Array; // cache for container transform

  requestAnimationFrameId: number | null;
  animationInitialPosition: number;
  animationFunction: TAnimationFunction; // function called each animation frame with current time as argument. returns expected container position,

  appendBeforeList: IInfiniteScrollerDeferredAppendList[];
  appendAfterList: IInfiniteScrollerDeferredAppendList[];
  clearList: IInfiniteScrollerDeferredClear[];
}

export interface IInfiniteScrollerWheelPrivate {
  wheelTarget: number | null;
  wheelObserver: INotificationsObserver<'wheel', WheelEvent>;
}

export interface IInfiniteScrollerTouchPrivate {
  touchStartObserver: INotificationsObserver<'touchstart', TouchEvent>;
  touchMoveObserver: INotificationsObserver<'touchmove', TouchEvent>;
  touchEndObserver: INotificationsObserver<'touchend', TouchEvent>;
  touchCurrentPosition: number;
  coords: CyclicTypedVectorArray<Float64Array>;
}

export interface IInfiniteScrollerMousePrivate {
  mouseDownObserver: INotificationsObserver<'mousedown', MouseEvent>;
  mouseMoveObserver: INotificationsObserver<'mousemove', MouseEvent>;
  mouseUpObserver: INotificationsObserver<'mouseup', MouseEvent>;
  mouseStartPosition: number;
  mouseCurrentPosition: number;
}

export interface IInfiniteScrollerPrivate extends IInfiniteScrollerOptionsPrivate,
  IInfiniteScrollerContainerPrivate,
  IInfiniteScrollerWheelPrivate,
  IInfiniteScrollerTouchPrivate,
  IInfiniteScrollerMousePrivate {
}

export interface IInfiniteScrollerInternal extends IInfiniteScroller {
  [INFINITE_SCROLLER_PRIVATE]: IInfiniteScrollerPrivate;
}
