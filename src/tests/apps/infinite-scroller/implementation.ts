import {
  IElementsIteratorNormalizedOptions, IElementsIteratorOptions, IInfiniteScroller,
  IInfiniteScrollerContentLimitStrategy, IInfiniteScrollerEventMap, TInfiniteScrollerDirection
} from './interfaces';
import { CustomElement } from '../../../core/component/custom-element/decorators/custom-element';
import { IInfiniteScrollerInternal, IInfiniteScrollerPrivate, INFINITE_SCROLLER_PRIVATE } from './privates';
import {
  IDirectionDetails, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY, INFINITE_SCROLLER_DEFAULT_DIRECTION,
  INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE, INFINITE_SCROLLER_DEFAULT_LOAD_UNLOAD_DISTANCE,
  INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE, INFINITE_SCROLLER_DIRECTION_CONSTANTS
} from './default-constants';
import { IsNull } from '../../../misc/helpers/is/IsNull';
import { SetPropertyOrDefault } from './helpers';
import {
  InfiniteScrollerElementsIterator,
  InfiniteScrollerLoop, InfiniteScrollerRemoveAllElements, InfiniteScrollerReplaceAllElements,
  InfiniteScrollerSetContentLimitStrategy,
  NormalizeIElementsIteratorOptions, NormalizeIElementsIteratorOptionsReversed
} from './functions';
import { ConstructInfiniteScroller } from './constructor';


/** METHODS **/


/* GETTERS/SETTERS */


// -- OPTIONS

// direction
export function InfiniteScrollerGetDirection(instance: IInfiniteScroller): TInfiniteScrollerDirection {
  return (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].direction;
}

export function InfiniteScrollerSetDirection(instance: IInfiniteScroller, direction?: TInfiniteScrollerDirection | null): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  if (IsNull(direction)) {
    direction = INFINITE_SCROLLER_DEFAULT_DIRECTION;
  } else {
    switch (direction) {
      case 'vertical':
      case 'horizontal':
        break;
      default:
        throw new TypeError(`Expected 'vertical' or 'horizontal' as InfiniteScroller.direction`);
    }
  }

  if (direction !== privates.direction) {
    privates.direction = direction;
    if (instance.getAttribute('direction') !== privates.direction) {
      instance.setAttribute('direction', privates.direction);
    }
  }

  // INFO should maybe reset animation (drag, wheel, etc...?)
  // InfiniteScrollerUpdateContainerDirection(instance);
}

// loadDistance
export function InfiniteScrollerGetLoadDistance(instance: IInfiniteScroller): number {
  return (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].loadDistance;
}

export function InfiniteScrollerSetLoadDistance(instance: IInfiniteScroller, loadDistance: number): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  if (IsNull(loadDistance)) {
    privates.loadDistance = INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE;
  } else {
    loadDistance = Number(loadDistance);
    if (Number.isNaN(loadDistance)) {
      throw new TypeError(`Expected number as InfiniteScroller.loadDistance`);
    } else if (loadDistance < 0) {
      throw new RangeError(`Expected value greater or equal to 0 for InfiniteScroller.loadDistance`);
    } else {
      privates.loadDistance = loadDistance;
      if (privates.loadDistance > privates.unloadDistance) {
        privates.unloadDistance = privates.loadDistance + INFINITE_SCROLLER_DEFAULT_LOAD_UNLOAD_DISTANCE;
      }
    }
  }
}

// unloadDistance
export function InfiniteScrollerGetUnloadDistance(instance: IInfiniteScroller): number {
  return (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].unloadDistance;
}

export function InfiniteScrollerSetUnloadDistance(instance: IInfiniteScroller, unloadDistance: number): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  if (IsNull(unloadDistance)) {
    privates.unloadDistance = INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE;
  } else {
    unloadDistance = Number(unloadDistance);
    if (Number.isNaN(unloadDistance)) {
      throw new TypeError(`Expected number as InfiniteScroller.unloadDistance`);
    } else if (unloadDistance < 0) {
      throw new RangeError(`Expected value greater or equal to 0 for InfiniteScroller.unloadDistance`);
    } else {
      privates.unloadDistance = unloadDistance;
      if (privates.unloadDistance <= privates.loadDistance) {
        privates.loadDistance = Math.max(0, privates.unloadDistance - INFINITE_SCROLLER_DEFAULT_LOAD_UNLOAD_DISTANCE);
      }
    }
  }
}


// -- CONTENT LIMIT

// contentLimitWheelStrategy
export function InfiniteScrollerGetContentLimitWheelStrategy(instance: IInfiniteScroller): IInfiniteScrollerContentLimitStrategy {
  return (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.wheel;
}

export function InfiniteScrollerSetContentLimitWheelStrategy(instance: IInfiniteScroller, strategy?: IInfiniteScrollerContentLimitStrategy | null): void {
  InfiniteScrollerSetContentLimitStrategy(instance, 'wheel', strategy);
}

// contentLimitTouchMoveStrategy
export function InfiniteScrollerGetContentLimitTouchMoveStrategy(instance: IInfiniteScroller): IInfiniteScrollerContentLimitStrategy {
  return (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.touchMove;
}

export function InfiniteScrollerSetContentLimitTouchMoveStrategy(instance: IInfiniteScroller, strategy?: IInfiniteScrollerContentLimitStrategy | null): void {
  InfiniteScrollerSetContentLimitStrategy(instance, 'touchMove', strategy);
}

// contentLimitTouchInertiaStrategy
export function InfiniteScrollerGetContentLimitTouchInertiaStrategy(instance: IInfiniteScroller): IInfiniteScrollerContentLimitStrategy {
  return (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.touchInertia;
}

export function InfiniteScrollerSetContentLimitTouchInertiaStrategy(instance: IInfiniteScroller, strategy?: IInfiniteScrollerContentLimitStrategy | null): void {
  InfiniteScrollerSetContentLimitStrategy(instance, 'touchInertia', strategy);
}

// contentLimitMouseMiddleStrategy
export function InfiniteScrollerGetContentLimitMouseMiddleStrategy(instance: IInfiniteScroller): IInfiniteScrollerContentLimitStrategy {
  return (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.mouseMiddle;
}

export function InfiniteScrollerSetContentLimitMouseMiddleStrategy(instance: IInfiniteScroller, strategy?: IInfiniteScrollerContentLimitStrategy | null): void {
  InfiniteScrollerSetContentLimitStrategy(instance, 'mouseMiddle', strategy);
}


// -- FIRST AND LAST CHILD

export function InfiniteScrollerGetFirstElement(instance: IInfiniteScroller): HTMLElement | null {
  return InfiniteScrollerElements(instance).next().value || null;
}

export function InfiniteScrollerGetLastElement(instance: IInfiniteScroller): HTMLElement | null {
  return InfiniteScrollerElements(instance, { reversed: true }).next().value || null;
}

export function InfiniteScrollerGetFirstVisibleElement(instance: IInfiniteScroller, options?: IElementsIteratorOptions): HTMLElement | null {
  const _options: IElementsIteratorNormalizedOptions = NormalizeIElementsIteratorOptions(options);
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  const directionDetails: IDirectionDetails = INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction];

  const cssElementPositionKey: string = _options.reversed
    ? directionDetails.cssPositionStartKey
    : directionDetails.cssPositionEndKey;

  const instancePosition: number = instance.getBoundingClientRect()[
    _options.reversed
      ? directionDetails.cssPositionEndKey
      : directionDetails.cssPositionStartKey
  ];

  const factor: number = _options.reversed ? -1 : 1;

  const iterator: Iterator<HTMLElement> = InfiniteScrollerElements(instance, options);
  let result: IteratorResult<HTMLElement>;
  while (!(result = iterator.next()).done) {
    const element: HTMLElement = result.value;
    const elementPosition: ClientRect = element.getBoundingClientRect();

    if (
      ((elementPosition[cssElementPositionKey] - instancePosition) * factor) // distance element <-> scroller
      > 0
    ) {
      return element;
    }
  }
  return null;
}


/* METHODS */

export function InfiniteScrollerElements(instance: IInfiniteScroller, options?: IElementsIteratorOptions): IterableIterator<HTMLElement> {
  return InfiniteScrollerElementsIterator(instance, NormalizeIElementsIteratorOptions(options));
}

export function InfiniteScrollerAppendBefore(instance: IInfiniteScroller, elements: HTMLElement[]): Promise<void> {
  return new Promise((resolve: any, reject: any) => {
    (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].appendBeforeList.push({
      elements,
      resolve,
      reject
    });
  });
}

export function InfiniteScrollerAppendAfter(instance: IInfiniteScroller, elements: HTMLElement[]): Promise<void> {
  return new Promise((resolve: any, reject: any) => {
    (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].appendAfterList.push({
      elements,
      resolve,
      reject
    });
  });
}

export function InfiniteScrollerReplaceElements(instance: IInfiniteScroller, elements: HTMLElement[]): void {
  return InfiniteScrollerReplaceAllElements(instance, elements);
}

// export function InfiniteScrollerClearElements(instance: IInfiniteScroller): void {
//   // return new Promise((resolve: any, reject: any) => {
//   //   (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].clearList.push({
//   //     resolve,
//   //     reject
//   //   });
//   // }) as any;
//   InfiniteScrollerRemoveAllElements(instance);
// }


/* HTML ELEMENT TRIGGER METHODS */

export function InfiniteScrollerOnConnected(instance: IInfiniteScroller): void {
  if ((instance.ownerDocument as Document).contains(instance)) {
    const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

    InfiniteScrollerLoop(instance);
    privates.touchStartObserver.activate();
    privates.wheelObserver.activate();
    privates.mouseDownObserver.activate();
  } else {
    throw new Error(`InfiniteScrollerOnConnected called, but instance not connected`);
  }
}

export function InfiniteScrollerOnDisconnected(instance: IInfiniteScroller): void {
  if ((instance.ownerDocument as Document).contains(instance)) {
    throw new Error(`InfiniteScrollerOnDisconnected called, but instance not disconnected`);
  } else {
    const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

    window.cancelAnimationFrame(privates.requestAnimationFrameId as number);
    privates.requestAnimationFrameId = null;

    privates.touchStartObserver.deactivate();
    privates.touchMoveObserver.deactivate();
    privates.touchEndObserver.deactivate();
    privates.wheelObserver.deactivate();
    privates.mouseDownObserver.deactivate();
    privates.mouseMoveObserver.deactivate();
    privates.mouseUpObserver.deactivate();
  }
}

export function InfiniteScrollerOnAttributeChanged(instance: IInfiniteScroller, name: string, oldValue: string, newValue: string): void {
  switch (name) {
    case 'direction':
      SetPropertyOrDefault(instance, 'direction', newValue as any, INFINITE_SCROLLER_DEFAULT_DIRECTION);
      break;
    case 'load-distance':
      SetPropertyOrDefault(instance, 'loadDistance', Number(newValue), INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE);
      break;
    case 'unload-distance':
      SetPropertyOrDefault(instance, 'unloadDistance', Number(newValue), INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE);
      break;
    case 'content-limit-wheel-strategy':
      SetPropertyOrDefault(instance, 'contentLimitWheelStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
    case 'content-limit-touch-move-strategy':
      SetPropertyOrDefault(instance, 'contentLimitTouchMoveStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
    case 'content-limit-touch-inertia-strategy':
      SetPropertyOrDefault(instance, 'contentLimitTouchInertiaStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
    case 'content-limit-mouse-middle-strategy':
      SetPropertyOrDefault(instance, 'contentLimitMouseMiddleStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
  }
}


/** CUSTOM ELEMENT */

@CustomElement({
  name: 'infinite-scroller',
  observedAttributes: [
    'direction',
    'load-distance',
    'unload-distance',
    'content-limit-wheel-strategy',
    'content-limit-touch-move-strategy',
    'content-limit-touch-inertia-strategy',
    'content-limit-mouse-middle-strategy',
  ]
})
export class InfiniteScroller extends HTMLElement implements IInfiniteScroller {

  constructor() {
    super();
    ConstructInfiniteScroller(this);
  }

  get direction(): TInfiniteScrollerDirection {
    return InfiniteScrollerGetDirection(this);
  }

  set direction(value: TInfiniteScrollerDirection) {
    InfiniteScrollerSetDirection(this, value);
  }


  get loadDistance(): number {
    return InfiniteScrollerGetLoadDistance(this);
  }

  set loadDistance(value: number) {
    InfiniteScrollerSetLoadDistance(this, value);
  }

  get unloadDistance(): number {
    return InfiniteScrollerGetUnloadDistance(this);
  }

  set unloadDistance(value: number) {
    InfiniteScrollerSetUnloadDistance(this, value);
  }


  get contentLimitWheelStrategy(): IInfiniteScrollerContentLimitStrategy {
    return InfiniteScrollerGetContentLimitWheelStrategy(this);
  }

  set contentLimitWheelStrategy(value: IInfiniteScrollerContentLimitStrategy) {
    InfiniteScrollerSetContentLimitWheelStrategy(this, value);
  }

  get contentLimitTouchMoveStrategy(): IInfiniteScrollerContentLimitStrategy {
    return InfiniteScrollerGetContentLimitTouchMoveStrategy(this);
  }

  set contentLimitTouchMoveStrategy(value: IInfiniteScrollerContentLimitStrategy) {
    InfiniteScrollerSetContentLimitTouchMoveStrategy(this, value);
  }

  get contentLimitTouchInertiaStrategy(): IInfiniteScrollerContentLimitStrategy {
    return InfiniteScrollerGetContentLimitTouchInertiaStrategy(this);
  }

  set contentLimitTouchInertiaStrategy(value: IInfiniteScrollerContentLimitStrategy) {
    InfiniteScrollerSetContentLimitTouchInertiaStrategy(this, value);
  }

  get contentLimitMouseMiddleStrategy(): IInfiniteScrollerContentLimitStrategy {
    return InfiniteScrollerGetContentLimitMouseMiddleStrategy(this);
  }

  set contentLimitMouseMiddleStrategy(value: IInfiniteScrollerContentLimitStrategy) {
    InfiniteScrollerSetContentLimitMouseMiddleStrategy(this, value);
  }

  get contentLimitStrategy(): IInfiniteScrollerContentLimitStrategy | null {
    return (
      (this.contentLimitWheelStrategy === this.contentLimitTouchMoveStrategy)
      && (this.contentLimitWheelStrategy === this.contentLimitTouchInertiaStrategy)
      && (this.contentLimitWheelStrategy === this.contentLimitMouseMiddleStrategy)
    )
      ? this.contentLimitWheelStrategy
      : null;
  }

  set contentLimitStrategy(value: IInfiniteScrollerContentLimitStrategy | null) {
    this.contentLimitWheelStrategy = value as IInfiniteScrollerContentLimitStrategy;
    this.contentLimitTouchMoveStrategy = value as IInfiniteScrollerContentLimitStrategy;
    this.contentLimitTouchInertiaStrategy = value as IInfiniteScrollerContentLimitStrategy;
    this.contentLimitMouseMiddleStrategy = value as IInfiniteScrollerContentLimitStrategy;
  }

  get firstElement(): HTMLElement | null {
    return InfiniteScrollerGetFirstElement(this);
  }

  get lastElement(): HTMLElement | null {
    return InfiniteScrollerGetLastElement(this);
  }

  getFirstVisibleElement(options?: IElementsIteratorOptions): HTMLElement | null {
    return InfiniteScrollerGetFirstVisibleElement(this, options);
  }

  elements(options?: IElementsIteratorOptions): IterableIterator<HTMLElement> {
    return InfiniteScrollerElements(this, options);
  }

  appendBefore(elements: HTMLElement[]): Promise<void> {
    return InfiniteScrollerAppendBefore(this, elements);
  }

  appendAfter(elements: HTMLElement[]): Promise<void> {
    return InfiniteScrollerAppendAfter(this, elements);
  }

  replaceElements(elements: HTMLElement[]): void {
    return InfiniteScrollerReplaceElements(this, elements);
  }


  connectedCallback(): void {
    InfiniteScrollerOnConnected(this);
  }

  disconnectedCallback(): void {
    InfiniteScrollerOnDisconnected(this);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    InfiniteScrollerOnAttributeChanged(this, name, oldValue, newValue);
  }

  addEventListener<K extends keyof IInfiniteScrollerEventMap>(type: K, listener: (this: HTMLElement, ev: IInfiniteScrollerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    return super.addEventListener(type, listener, options);
  }
}


