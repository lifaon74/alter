import { CustomElement } from '../core/custom-element/implementation';
import { AttachNode, DestroyNodeSafe } from '../../custom-node/node-state-observable/mutations';
import { CyclicTypedVectorArray } from '../../classes/cyclic/CyclicTypedVectorArray';
import { IInfiniteScroller, IInfiniteScrollerContentLimitStrategy, TInfiniteScrollerDirection } from './interfaces';
import { LoadElementsEvent } from './events/load-elements-event/implementation';
import { UnloadElementsEvent } from './events/unload-elements-event/implementation';
import { IEventsObservable, EventsObservable, INotificationsObserver } from '@lifaon/observables';
import { ConstructClassWithPrivateMembers } from '../../misc/helpers/ClassWithPrivateMembers';


export function DecodeCSSTransformMatrix<T extends (Float32Array | Float64Array)>(matrix: T, transformString: string): T {
  let match: RegExpExecArray | null;
  if ((transformString === 'none') || (transformString === '')) {
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 1;
    matrix[5] = 0;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 1;
  } else if ((match = /^matrix\((.*)\)$/.exec(transformString)) !== null) {
    const values: number[] = match[1].split(',').map(_ => parseFloat(_));
    matrix[0] = values[0];
    matrix[1] = values[2];
    matrix[2] = values[4];
    matrix[3] = values[1];
    matrix[4] = values[3];
    matrix[5] = values[5];
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = values[0];
  } else {
    throw new SyntaxError(`Cannot parse transformString: '${transformString}'`);
  }
  return matrix;
}

export function EncodeCSSTransformMatrix(matrix: ArrayLike<number>): string {
  return `matrix(${matrix[0]}, ${matrix[3]}, ${matrix[1]}, ${matrix[4]}, ${matrix[2]}, ${matrix[5]})`;
}


/*-------------------*/

export const INFINITE_SCROLLER_PRIVATE = Symbol('infinite-scroller-private');

export type TAnimationFunction = (time: number) => number;

export interface IInfiniteScrollerContentLimitStrategies {
  wheel: IInfiniteScrollerContentLimitStrategy;
  touchMove: IInfiniteScrollerContentLimitStrategy;
  touchInertia: IInfiniteScrollerContentLimitStrategy;
  mouseMiddle: IInfiniteScrollerContentLimitStrategy;
}

export interface IInfiniteScrollerPrivate {
  direction: TInfiniteScrollerDirection;
  loadDistance: number;
  unloadDistance: number;
  contentLimitStrategies: IInfiniteScrollerContentLimitStrategies;

  container: HTMLDivElement;
  containerStyle: CSSStyleDeclaration;
  transformMatrix: Float64Array; // cache for container transform

  requestAnimationFrameId: number | null;
  animationInitialPosition: number;
  animationFunction: TAnimationFunction;

  appendBeforeList: [HTMLElement[], () => void, () => void][];
  appendAfterList: [HTMLElement[], () => void, () => void][];

  wheelTarget: number | null;
  wheelObserver: INotificationsObserver<'wheel', WheelEvent>;

  touchStartObserver: INotificationsObserver<'touchstart', TouchEvent>;
  touchMoveObserver: INotificationsObserver<'touchmove', TouchEvent>;
  touchEndObserver: INotificationsObserver<'touchend', TouchEvent>;
  touchCurrentPosition: number;
  coords: CyclicTypedVectorArray<Float64Array>;

  mouseDownObserver: INotificationsObserver<'mousedown', MouseEvent>;
  mouseMoveObserver: INotificationsObserver<'mousemove', MouseEvent>;
  mouseUpObserver: INotificationsObserver<'mouseup', MouseEvent>;
  mouseStartPosition: number;
  mouseCurrentPosition: number;
}

export interface IInfiniteScrollerInternal extends IInfiniteScroller {
  [INFINITE_SCROLLER_PRIVATE]: IInfiniteScrollerPrivate;
}

const INFINITE_SCROLLER_COORDS_LENGTH: number = 300;
const INFINITE_SCROLLER_DEFAULT_DIRECTION: TInfiniteScrollerDirection = 'vertical';
const INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE: number = 100;
const INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE: number = 500;
const INFINITE_SCROLLER_DEFAULT_LOAD_UNLOAD_DISTANCE: number = INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE - INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE;
const INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY: IInfiniteScrollerContentLimitStrategy = 'ignore';

export interface IDirectionDetails {
  transformMatrixIndex: number;
  containerComputedSizeKey: 'offsetHeight' | 'offsetWidth';
  containerSizeKey: 'height' | 'width';
  containerComplementarySizeKey: 'height' | 'width';
  pointerPositionKey: 'clientX' | 'clientY';
  touchCoordIndex: number;
}

export type TDirectionConstant = {
  [key in TInfiniteScrollerDirection]: IDirectionDetails;
}

const INFINITE_SCROLLER_DIRECTION_CONSTANTS: TDirectionConstant = {
  vertical: {
    transformMatrixIndex: 5,
    containerComputedSizeKey: 'offsetHeight',
    containerSizeKey: 'height',
    containerComplementarySizeKey: 'width',
    pointerPositionKey: 'clientY',
    touchCoordIndex: 2,
  },
  horizontal: {
    transformMatrixIndex: 2,
    containerComputedSizeKey: 'offsetWidth',
    containerSizeKey: 'width',
    containerComplementarySizeKey: 'height',
    pointerPositionKey: 'clientX',
    touchCoordIndex: 1,
  }
};


export function ConstructInfiniteScroller(infiniteScroller: IInfiniteScroller): void {
  ConstructClassWithPrivateMembers(infiniteScroller, INFINITE_SCROLLER_PRIVATE);
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  /** OPTIONS **/
  privates.direction = INFINITE_SCROLLER_DEFAULT_DIRECTION;
  privates.loadDistance = INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE;
  privates.unloadDistance = INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE;
  privates.contentLimitStrategies = Object.preventExtensions<IInfiniteScrollerContentLimitStrategies>({
    wheel: INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY,
    touchMove: INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY,
    touchInertia: INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY,
    mouseMiddle: INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY,
  });

  /** CONTAINER **/
  privates.container = infiniteScroller.ownerDocument.createElement('div');
  privates.container.classList.add('container');

  privates.containerStyle = window.getComputedStyle(privates.container);
  AttachNode(privates.container, infiniteScroller);

  privates.transformMatrix = new Float64Array(9);
  InfiniteScrollerUpdateTransformMatrix(infiniteScroller);


  privates.requestAnimationFrameId = null;
  privates.animationInitialPosition = 0;
  privates.animationFunction = () => privates.animationInitialPosition;

  privates.appendBeforeList = [];
  privates.appendAfterList = [];

  const infiniteScrollerEventsObservable: IEventsObservable<HTMLElementEventMap> = new EventsObservable<HTMLElementEventMap>(infiniteScroller);
  const windowEventsObservable: IEventsObservable<WindowEventMap> = new EventsObservable<WindowEventMap>(window);

  /** WHEEL **/
  privates.wheelTarget = null;

  privates.wheelObserver = infiniteScrollerEventsObservable
    .addListener<'wheel'>('wheel', (event: WheelEvent) => {
      InfiniteScrollerOnWheel(infiniteScroller, event);
    });


  /** TOUCH **/
  privates.touchCurrentPosition = 0;
  privates.coords = new CyclicTypedVectorArray<Float64Array>(new Float64Array(INFINITE_SCROLLER_COORDS_LENGTH), 3);


  privates.touchStartObserver = infiniteScrollerEventsObservable
    .addListener<'touchstart'>('touchstart', (event: TouchEvent) => {
      InfiniteScrollerOnTouchStart(infiniteScroller, event);
    });

  privates.touchMoveObserver = windowEventsObservable
    .addListener<'touchmove'>('touchmove', (event: TouchEvent) => {
      InfiniteScrollerOnTouchMove(infiniteScroller, event);
    });

  privates.touchEndObserver = windowEventsObservable
    .addListener<'touchend'>('touchend', (event: TouchEvent) => {
      InfiniteScrollerOnTouchEnd(infiniteScroller, event);
    });


  /** MOUSE **/
  privates.mouseStartPosition = 0;
  privates.mouseCurrentPosition = 0;

  privates.mouseDownObserver = infiniteScrollerEventsObservable
    .addListener<'mousedown'>('mousedown', (event: MouseEvent) => {
      InfiniteScrollerOnMouseDown(infiniteScroller, event);
    });

  privates.mouseMoveObserver = windowEventsObservable
    .addListener<'mousemove'>('mousemove', (event: MouseEvent) => {
      InfiniteScrollerOnMouseMove(infiniteScroller, event);
    });

  privates.mouseUpObserver = windowEventsObservable
    .addListener<'mouseup'>('mouseup', (event: MouseEvent) => {
      InfiniteScrollerOnMouseUp(infiniteScroller, event);
    });


  InfiniteScrollerSetDirection(infiniteScroller, INFINITE_SCROLLER_DEFAULT_DIRECTION);
}


/**
 * SCROLL USING
 */
const tempCoords: Float64Array = new Float64Array(INFINITE_SCROLLER_COORDS_LENGTH);
const tempVec3Float64Array = new Float64Array(3);

/** TOUCH **/
export function InfiniteScrollerOnTouchStart(infiniteScroller: IInfiniteScroller, event: TouchEvent): void {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  if (event.touches.length === 1) {
    event.preventDefault();

    const touch: Touch = event.touches[0];

    const touchPosition: number = touch[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
    privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(infiniteScroller) - touchPosition;

    privates.wheelTarget = null;
    privates.touchCurrentPosition = touchPosition;

    privates.animationFunction = (): number => {
      const position: number = privates.animationInitialPosition + privates.touchCurrentPosition;

      if (privates.contentLimitStrategies.touchMove === 'ignore') {
        return position;
      } else {
        const endPosition: number = infiniteScroller[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
          - privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
        if ((position >= 0) || (endPosition >= 0)) {
          if (privates.contentLimitStrategies.touchMove === 'stop') {
            privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(infiniteScroller) - privates.touchCurrentPosition;
          }
          return 0;
        } else if (position <= endPosition) {
          if (privates.contentLimitStrategies.touchMove === 'stop') {
            privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(infiniteScroller) - privates.touchCurrentPosition;
          }
          return endPosition;
        } else {
          return position;
        }
      }
    };

    privates.coords.reset();
    WriteTouchCoordsFromTouch(privates.coords, touch);

    privates.touchMoveObserver.activate();
    privates.touchEndObserver.activate();
  } else {
    privates.touchMoveObserver.deactivate();
    privates.touchEndObserver.deactivate();
  }
}

export function InfiniteScrollerOnTouchMove(infiniteScroller: IInfiniteScroller, event: TouchEvent): void {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  const touch: Touch = event.touches[0];
  privates.touchCurrentPosition = touch[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
  WriteTouchCoordsFromTouch(privates.coords, touch);
}

export function InfiniteScrollerOnTouchEnd(infiniteScroller: IInfiniteScroller, event: TouchEvent): void {
  if (event.touches.length === 1) {
    InfiniteScrollerOnTouchStart(infiniteScroller, event);
  } else {
    const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

    privates.touchMoveObserver.deactivate();
    privates.touchEndObserver.deactivate();

    const now: number = performance.now();

    // gets the list of touch points
    const coords: Float64Array = privates.coords.toTypedArray(tempCoords);

    // update last point with current time (because touchend is at this position)
    let i = coords.length - 3;
    coords[i] = now;

    // get the coords fresher than 0.1 second
    for (; i >= 0; i -= 3) {
      if ((now - coords[i]) > 100) {
        break;
      }
    }
    // i += 3;
    i = Math.max(i, 0);

    if ((coords.length - i) > 3) {
      // console.log(coords.subarray(i));
      privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(infiniteScroller);
      const lastIndex: number = coords.length - 3;
      const elapsedTime: number = coords[lastIndex] - coords[i];
      const distance: number = coords[lastIndex + INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].touchCoordIndex]
        - coords[i + INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].touchCoordIndex];

      const initialVelocity: number = distance / elapsedTime;

      if (Math.abs(initialVelocity) > 0.05) {
        const duration: number = Math.min(1500, Math.abs(initialVelocity) * 300);
        const acceleration: number = -(initialVelocity / duration);
        const endOfCoursePosition: number = (initialVelocity * duration) / 2;
        const startTime: number = performance.now();

        privates.animationFunction = (time: number): number => {
          time -= startTime;
          const position: number = (
            (time < duration)
              ? ((0.5 * acceleration * time * time) + (initialVelocity * time))
              : endOfCoursePosition
          ) + privates.animationInitialPosition;

          if (privates.contentLimitStrategies.touchInertia === 'ignore') {
            return position;
          } else {
            const endPosition: number = infiniteScroller[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
              - privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
            if ((position >= 0) || (endPosition >= 0)) {
              if (privates.contentLimitStrategies.touchInertia === 'stop') {
                privates.animationInitialPosition = 0;
                privates.animationFunction = () => privates.animationInitialPosition;
              }
              return 0;
            } else if (position <= endPosition) {
              if (privates.contentLimitStrategies.touchInertia === 'stop') {
                privates.animationInitialPosition = endPosition;
                privates.animationFunction = () => privates.animationInitialPosition;
              }
              return endPosition;
            } else {
              return position;
            }
          }
        };
      }
    }
  }

}

function WriteTouchCoordsFromTouch(coords: CyclicTypedVectorArray<Float64Array>, touch: Touch): void {
  tempVec3Float64Array[0] = performance.now();
  tempVec3Float64Array[1] = touch.clientX;
  tempVec3Float64Array[2] = touch.clientY;
  coords.write(tempVec3Float64Array, true);
}


/** WHEEL **/
export function InfiniteScrollerOnWheel(infiniteScroller: IInfiniteScroller, event: WheelEvent): void {
  event.preventDefault();

  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  let distance: number = GetWheelDeltaInPx(-event.deltaY || -event.deltaX, event.deltaMode);
  privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(infiniteScroller);
  // as long as the wheeling is in the same direction, increment wheelTarget, else move from initial position
  distance += (
    ((privates.wheelTarget === null) || ((privates.wheelTarget > privates.animationInitialPosition) ? (distance < 0) : (distance > 0)))
      ? 0
      : (privates.wheelTarget - privates.animationInitialPosition)
  );

  const duration: number = 300;
  const initialVelocity: number = (2 * distance) / duration;
  const acceleration: number = -initialVelocity / duration; // or -(2 * distance) / (time * time)
  const startTime: number = performance.now();

  privates.animationFunction = (time: number): number => {
    time -= startTime;
    const position: number = (
      (time < duration)
        ? ((0.5 * acceleration * time * time) + (initialVelocity * time))
        : distance
    ) + privates.animationInitialPosition;

    if (privates.contentLimitStrategies.wheel === 'ignore') {
      return position;
    } else {
      const endPosition: number = infiniteScroller[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
        - privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
      if ((position >= 0) || (endPosition >= 0)) {
        if (privates.contentLimitStrategies.wheel === 'stop') {
          privates.animationInitialPosition = 0;
          privates.animationFunction = () => privates.animationInitialPosition;
          privates.wheelTarget = null;
        }
        return 0;
      } else if (position <= endPosition) {
        if (privates.contentLimitStrategies.wheel === 'stop') {
          privates.animationInitialPosition = endPosition;
          privates.animationFunction = () => privates.animationInitialPosition;
          privates.wheelTarget = null;
        }
        return endPosition;
      } else {
        return position;
      }
    }
  };

  privates.wheelTarget = privates.animationInitialPosition + distance;
}

function GetWheelDeltaInPx(delta: number, mode: number): number {
  // https://stackoverflow.com/questions/20110224/what-is-the-height-of-a-line-in-a-wheel-event-deltamode-dom-delta-line
  switch (mode) {
    case WheelEvent.DOM_DELTA_PIXEL:
      return delta;
    case WheelEvent.DOM_DELTA_LINE:
      return delta * 33; // at lest if navigator.platform === 'Win32'
    case WheelEvent.DOM_DELTA_PAGE:
      return delta * 300; // personal value
    default:
      throw new TypeError(`Invalid deltaMode`);
  }
}

/** MOUSE **/
export function InfiniteScrollerOnMouseDown(infiniteScroller: IInfiniteScroller, event: MouseEvent): void {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  if (event.button === 1) { // middle button
    event.preventDefault();
    privates.mouseStartPosition = event[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
    privates.mouseCurrentPosition = privates.mouseStartPosition;
    privates.wheelTarget = null;

    privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(infiniteScroller);
    let lastTime: number = performance.now();

    privates.animationFunction = (time: number): number => {
      const elapsedTime: number = time - lastTime;
      lastTime = time;
      const position: number = privates.animationInitialPosition - ((privates.mouseCurrentPosition - privates.mouseStartPosition) / elapsedTime) * 2;

      if (privates.contentLimitStrategies.mouseMiddle === 'ignore') {
        privates.animationInitialPosition = position;
        return position;
      } else {
        const endPosition: number = infiniteScroller[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
          - privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
        if ((position >= 0) || (endPosition >= 0)) {
          privates.animationInitialPosition = 0;
          return 0;
        } else if (position <= endPosition) {
          privates.animationInitialPosition = endPosition;
          return endPosition;
        } else {
          privates.animationInitialPosition = position;
          return position;
        }
      }
    };

    document.documentElement.style.setProperty('cursor', 'row-resize'); // ns-resize -- col-resize | ew-resize || all-scroll, move
    privates.mouseMoveObserver.activate();
    privates.mouseUpObserver.activate();
  }
}

export function InfiniteScrollerOnMouseMove(infiniteScroller: IInfiniteScroller, event: MouseEvent): void {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  privates.mouseCurrentPosition = event[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
  event.preventDefault();
}

export function InfiniteScrollerOnMouseUp(infiniteScroller: IInfiniteScroller, event: MouseEvent): void {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(infiniteScroller);
  privates.animationFunction = () => privates.animationInitialPosition;

  document.documentElement.style.removeProperty('cursor');
  privates.mouseMoveObserver.deactivate();
  privates.mouseUpObserver.deactivate();
}



/**
 * READ/WRITE CONTAINER OFFSET
 */

export function InfiniteScrollerUpdateTransformMatrix(infiniteScroller: IInfiniteScroller): Float64Array {
  return DecodeCSSTransformMatrix(
    (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].transformMatrix,
    (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].containerStyle.getPropertyValue('transform')
  );
}

export function InfiniteScrollerApplyTransformMatrix(infiniteScroller: IInfiniteScroller): void {
  (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].container.style.setProperty(
    'transform',
    EncodeCSSTransformMatrix((infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].transformMatrix)
  );
}

export function InfiniteScrollerSetContainerTranslation(infiniteScroller: IInfiniteScroller, value: number): void {
  (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].transformMatrix[
    INFINITE_SCROLLER_DIRECTION_CONSTANTS[(infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].direction].transformMatrixIndex
  ] = Math.round(value);
  InfiniteScrollerApplyTransformMatrix(infiniteScroller);
}

export function InfiniteScrollerGetContainerTranslation(infiniteScroller: IInfiniteScroller): number {
  InfiniteScrollerUpdateTransformMatrix(infiniteScroller);
  return (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].transformMatrix[
    INFINITE_SCROLLER_DIRECTION_CONSTANTS[(infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].direction].transformMatrixIndex
  ];
}


/**
 * ANIMATE
 */

export function InfiniteScrollerLoop(infiniteScroller: IInfiniteScroller): void {
  (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].requestAnimationFrameId = window.requestAnimationFrame(() => {
    let translation: number = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].animationFunction(performance.now());
    translation = InfiniteScrollerContainerUpdate(infiniteScroller, translation);
    InfiniteScrollerAnimationUpdate(infiniteScroller, translation);
    InfiniteScrollerLoop(infiniteScroller);
  });
}

export function InfiniteScrollerAnimationUpdate(
  infiniteScroller: IInfiniteScroller,
  translation: number = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].animationFunction(performance.now())
): void {
  InfiniteScrollerSetContainerTranslation(infiniteScroller, translation);
}


/**
 * LOAD/UNLOAD
 */

export function InfiniteScrollerContainerUpdate(infiniteScroller: IInfiniteScroller, translation: number): number {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  const beforeLimit: number = -privates.loadDistance;
  const afterLimit: number = infiniteScroller[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
    - privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
    + privates.loadDistance;

  if (translation <= afterLimit) {
    // console.log('load-after', afterLimit - translation);
    infiniteScroller.dispatchEvent(new LoadElementsEvent('load-after', {
      elementReference: InfiniteScrollerGetLastChild(infiniteScroller),
      distance: afterLimit - translation
    }));
  } else if (translation >= beforeLimit) {
    // console.log('load-before', translation - beforeLimit);
    infiniteScroller.dispatchEvent(new LoadElementsEvent('load-before', {
      elementReference: InfiniteScrollerGetFirstChild(infiniteScroller),
      distance: translation - beforeLimit
    }));
  }

  translation = InfiniteScrollerRemoveInvisibleElements(infiniteScroller, translation);
  translation = InfiniteScrollerAppendElements(infiniteScroller, translation);


  return translation;
}


export function InfiniteScrollerRemoveInvisibleElements(infiniteScroller: IInfiniteScroller, translation: number): number {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  const beforeChunks: HTMLElement[] = [], afterChunks: HTMLElement[] = [];
  let beforeLength: number = 0, afterLength: number = 0;

  let chunk: HTMLElement | null, limit: number;

  limit = -translation - privates.unloadDistance;
  chunk = privates.container.firstElementChild as HTMLElement| null;
  while (chunk !== null) {
    const nextLength: number = beforeLength + chunk[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
    if (nextLength > limit) {
      break;
    } else {
      beforeChunks.push(chunk);
      beforeLength = nextLength;
    }
    chunk = chunk.nextElementSibling as HTMLElement| null;
  }

  limit = privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
    + translation
    - infiniteScroller[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
    - privates.unloadDistance;
  chunk = privates.container.lastElementChild as HTMLElement| null;
  while (chunk !== null) {
    const nextLength: number = afterLength + chunk[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
    if (nextLength > limit) {
      break;
    } else {
      afterChunks.push(chunk);
      afterLength = nextLength;
    }
    chunk = chunk.previousElementSibling as HTMLElement| null;
  }

  if (beforeChunks.length > 0) {
    const beforeRemovedElements: Element[] = [];

    for (let i = 0, l = beforeChunks.length; i < l ; i++) {
      const chunk: HTMLElement = beforeChunks[i];
      let element: Element | null = chunk.firstElementChild;
      while (element !== null) {
        beforeRemovedElements.push(element);
        element = element.nextElementSibling;
      }
      DestroyNodeSafe(chunk);
      // chunk.remove();
    }

    // console.log('unload-before');
    infiniteScroller.dispatchEvent(new UnloadElementsEvent('unload-before', {
      elements: beforeRemovedElements
    }));

    const shift: number = beforeLength;
    privates.animationInitialPosition += shift;
    privates.wheelTarget += shift;
    translation += shift;
  }

  if (afterChunks.length > 0) {
    const afterRemovedElements: Element[] = [];

    for (let i = 0, l = afterChunks.length; i < l ; i++) {
      const chunk: HTMLElement = afterChunks[i];
      let element: Element | null = chunk.firstElementChild;
      while (element !== null) {
        afterRemovedElements.push(element);
        element = element.nextElementSibling;
      }
      DestroyNodeSafe(chunk);
      // chunk.remove();
    }

    // console.log('unload-after');
    infiniteScroller.dispatchEvent(new UnloadElementsEvent('unload-after', {
      elements: afterRemovedElements
    }));
  }

  return translation;
}

export function InfiniteScrollerAppendElements(infiniteScroller: IInfiniteScroller, translation: number): number {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  // BEFORE
  const beforeLength: number = privates.appendBeforeList.length;
  if (beforeLength > 0) {
    const beforeChunk: HTMLElement = InfiniteScrollerCreateChunk(infiniteScroller);

    for (let i = 0; i < beforeLength; i++) {
      const [elements, resolve] = privates.appendBeforeList[i];
      resolve();

      for (let j = 0, l = elements.length; j < l; j++) {
        AttachNode(elements[j], beforeChunk);
        // beforeChunk.appendChild(elements[j]);
      }
    }
    privates.appendBeforeList.length = 0;

    AttachNode(beforeChunk, privates.container, privates.container.firstElementChild);
    // privates.container.insertBefore(beforeChunk, privates.container.firstElementChild);

    const shift: number = -beforeChunk[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
    privates.animationInitialPosition += shift;
    privates.wheelTarget += shift;
    translation += shift;
  }

  // AFTER
  const afterLength: number = privates.appendAfterList.length;
  if (afterLength > 0) {
    const afterChunk: HTMLElement = InfiniteScrollerCreateChunk(infiniteScroller);

    for (let i = 0; i < afterLength; i++) {
      const [elements, resolve] = privates.appendAfterList[i];
      resolve();

      for (let j = 0, l = elements.length; j < l; j++) {
        AttachNode(elements[j], afterChunk);
        // afterChunk.appendChild(elements[j]);
      }
    }
    privates.appendAfterList.length = 0;

    AttachNode(afterChunk, privates.container);
    // privates.container.appendChild(afterChunk);
  }

  return translation;
}

export function InfiniteScrollerCreateChunk(infiniteScroller: IInfiniteScroller): HTMLElement {
  const chunk: HTMLElement = infiniteScroller.ownerDocument.createElement('div');
  chunk.classList.add('chunk');
  return chunk;
}



export function * InfiniteScrollerGetChildren(infiniteScroller: IInfiniteScroller): IterableIterator<HTMLElement> {
  const container: HTMLElement = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].container;
  let chunk: HTMLElement | null = container.firstElementChild as HTMLElement| null;
  while ((chunk !== null) && (chunk.parentElement === container)) {
    let node: HTMLElement | null = chunk.firstElementChild as HTMLElement| null;
    while ((node !== null) && (node.parentElement === chunk)) {
      yield node;
      node = node.nextElementSibling as HTMLElement| null;
    }

    chunk = chunk.nextElementSibling as HTMLElement| null;
  }
}

export function * InfiniteScrollerGetChildrenReversed(infiniteScroller: IInfiniteScroller): IterableIterator<HTMLElement> {
  const container: HTMLElement = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].container;
  let chunk: HTMLElement | null = container.lastElementChild as HTMLElement| null;
  while ((chunk !== null) && (chunk.parentElement === container)) {
    let node: HTMLElement | null = chunk.lastElementChild as HTMLElement| null;
    while ((node !== null) && (node.parentElement === chunk)) {
      yield node;
      node = node.previousElementSibling as HTMLElement| null;
    }

    chunk = chunk.previousElementSibling as HTMLElement| null;
  }
}

export function InfiniteScrollerGetFirstChild(infiniteScroller: IInfiniteScroller): HTMLElement | null {
  return InfiniteScrollerListChildren(infiniteScroller).next().value || null;
}

export function InfiniteScrollerGetLastChild(infiniteScroller: IInfiniteScroller): HTMLElement | null {
  return InfiniteScrollerListChildren(infiniteScroller, true).next().value || null;
}

export function InfiniteScrollerListChildren(infiniteScroller: IInfiniteScroller, reversed: boolean = false): IterableIterator<HTMLElement> {
  return reversed
    ? InfiniteScrollerGetChildrenReversed(infiniteScroller)
    : InfiniteScrollerGetChildren(infiniteScroller);
}


export function InfiniteScrollerSetDirection(infiniteScroller: IInfiniteScroller, direction: TInfiniteScrollerDirection | null): void {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  if ((direction === null) || (direction === void 0)) {
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
    if (infiniteScroller.getAttribute('direction') !== privates.direction) {
      infiniteScroller.setAttribute('direction', privates.direction);
    }
  }

  // InfiniteScrollerUpdateContainerDirection(infiniteScroller);
}

export function InfiniteScrollerAppendBeforeDeferred(infiniteScroller: IInfiniteScroller, elements: HTMLElement[]): Promise<void> {
  return new Promise((resolve: any, reject: any) => {
    (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].appendBeforeList.push([elements, resolve, reject])
  });
}

export function InfiniteScrollerAppendAfterDeferred(infiniteScroller: IInfiniteScroller, elements: HTMLElement[]): Promise<void> {
  return new Promise((resolve: any, reject: any) => {
    (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].appendAfterList.push([elements, resolve, reject])
  });
}

export function InfiniteScrollerClearElements(infiniteScroller: IInfiniteScroller): void {
  const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  privates.animationInitialPosition = 0;
  privates.animationFunction = () => privates.animationInitialPosition;

  privates.appendBeforeList = [];
  privates.appendAfterList = [];

  privates.wheelTarget = null;

  let chunk: Element | null = privates.container.firstElementChild;
  const removedElements: Element[] = [];

  while (chunk !== null) {
    let element: Element | null = chunk.firstElementChild;
    while (element !== null) {
      removedElements.push(element);
      element = element.nextElementSibling;
    }
    let nextElementSibling: Element | null = chunk.nextElementSibling;
    DestroyNodeSafe(chunk);
    // chunk.remove();
    chunk = nextElementSibling;
  }

  infiniteScroller.dispatchEvent(new UnloadElementsEvent('clear', {
    elements: removedElements
  }));
}


export function InfiniteScrollerSetContentLimitStrategy(
  infiniteScroller: IInfiniteScroller,
  key: keyof IInfiniteScrollerContentLimitStrategies,
  strategy: IInfiniteScrollerContentLimitStrategy
): void {
  if ((strategy === null) || (strategy === void 0)) {
    ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies[key] = INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY;
  } else {
    switch (strategy) {
      case 'ignore':
      case 'pause':
      case 'stop':
        ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies[key] = strategy;
        break;
      default:
        throw new TypeError(`Expected 'ignore', 'ignore' or 'ignore' as contentLimit${key}Strategy`);
    }
  }
}


/**
 * ACTIVATE/DEACTIVATE
 */

export function InfiniteScrollerOnConnected(infiniteScroller: IInfiniteScroller): void {
  if (infiniteScroller.ownerDocument.contains(infiniteScroller)) {
    const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

    InfiniteScrollerLoop(infiniteScroller);
    privates.touchStartObserver.activate();
    privates.wheelObserver.activate();
    privates.mouseDownObserver.activate();
  } else {
    throw new Error(`InfiniteScrollerOnConnected called, but infiniteScroller not connected`);
  }
}

export function InfiniteScrollerOnDisconnected(infiniteScroller: IInfiniteScroller): void {
  if (infiniteScroller.ownerDocument.contains(infiniteScroller)) {
    throw new Error(`InfiniteScrollerOnDisconnected called, but infiniteScroller not disconnected`);
  } else {
    const privates: IInfiniteScrollerPrivate = (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

    window.cancelAnimationFrame((infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].requestAnimationFrameId);
    (infiniteScroller as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].requestAnimationFrameId = null;

    privates.touchStartObserver.deactivate();
    privates.touchMoveObserver.deactivate();
    privates.touchEndObserver.deactivate();
    privates.wheelObserver.deactivate();
    privates.mouseDownObserver.deactivate();
    privates.mouseMoveObserver.deactivate();
    privates.mouseUpObserver.deactivate();
  }
}

export function InfiniteScrollerOnAttributeChanged(infiniteScroller: IInfiniteScroller, name: string, oldValue: string, newValue: string): void {
  switch (name) {
    case 'direction':
      SetPropertyOrDefault(infiniteScroller, 'direction', newValue as any, INFINITE_SCROLLER_DEFAULT_DIRECTION);
      break;
    case 'load-distance':
      SetPropertyOrDefault(infiniteScroller, 'loadDistance', Number(newValue), INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE);
      break;
    case 'unload-distance':
      SetPropertyOrDefault(infiniteScroller, 'unloadDistance', Number(newValue), INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE);
      break;
    case 'content-limit-wheel-strategy':
      SetPropertyOrDefault(infiniteScroller, 'contentLimitWheelStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
    case 'content-limit-touch-move-strategy':
      SetPropertyOrDefault(infiniteScroller, 'contentLimitTouchMoveStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
    case 'content-limit-touch-inertia-strategy':
      SetPropertyOrDefault(infiniteScroller, 'contentLimitTouchInertiaStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
    case 'content-limit-mouse-middle-strategy':
      SetPropertyOrDefault(infiniteScroller, 'contentLimitMouseMiddleStrategy', newValue as any, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY);
      break;
  }
}

function SetPropertyOrDefault<O extends { [key: string]: any }, P extends string>(target: O, propertyName: P, value: O[P], defaultValue: O[P]): void {
  try {
    target[propertyName] = value;
  } catch (e) {
    target[propertyName] = defaultValue;
  }
}



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

  static loadDefaultStyle(): HTMLStyleElement {
    const style: HTMLStyleElement = document.createElement('style');
    style.textContent = `
      infinite-scroller {
        display: block;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
      
      infinite-scroller[direction="vertical"] {
      }
      
      infinite-scroller[direction="horizontal"] {
      }
      
      infinite-scroller[direction="vertical"] > * { /* .container */
        display: block;
        width: 100%;
      }
      
      infinite-scroller[direction="vertical"] > * > * { /* .chunk */
        display: block;
        width: 100%;
      }
      
      infinite-scroller[direction="vertical"] > * > * > * { /* element */
        display: block;
        width: 100%;
      }
      
      infinite-scroller[direction="horizontal"] > * { /* .container */
        display: inline-block;
        vertical-align: top;
        height: 100%;
        white-space: nowrap;
      }
      
      infinite-scroller[direction="horizontal"] > * > * { /* .chunk */
        display: inline-block;
        vertical-align: top;
        height: 100%;
        white-space: nowrap;
      }
      
      infinite-scroller[direction="horizontal"] > * > * > * { /* element */
        display: inline-block;
        vertical-align: top;
        height: 100%;
      }
    `;

    AttachNode(style, document.head);
    // document.head.appendChild(style);

    return style;
  }

  constructor() {
    super();
    ConstructInfiniteScroller(this);
  }

  get direction(): TInfiniteScrollerDirection {
    return ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].direction;
  }

  set direction(value: TInfiniteScrollerDirection | null) {
    InfiniteScrollerSetDirection(this, value);
  }


  get loadDistance(): number {
    return ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].loadDistance;
  }

  set loadDistance(value: number | null) {
    const privates: IInfiniteScrollerPrivate= ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
    if ((value === null) || (value === void 0)) {
      privates.loadDistance = INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE;
    } else {
      value = Number(value);
      if (Number.isNaN(value)) {
        throw new TypeError(`Expected number as InfiniteScroller.loadDistance`);
      } else if (value < 0) {
        throw new RangeError(`Expected value greater or equal to 0 for InfiniteScroller.loadDistance`)
      } else {
        privates.loadDistance = value;
        if (privates.loadDistance > privates.unloadDistance) {
          privates.unloadDistance = privates.loadDistance + INFINITE_SCROLLER_DEFAULT_LOAD_UNLOAD_DISTANCE;
        }
      }
    }
  }

  get unloadDistance(): number {
    return ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].unloadDistance;
  }

  set unloadDistance(value: number | null) {
    const privates: IInfiniteScrollerPrivate= ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
    if ((value === null) || (value === void 0)) {
      privates.unloadDistance = INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE;
    } else {
      value = Number(value);
      if (Number.isNaN(value)) {
        throw new TypeError(`Expected number as InfiniteScroller.unloadDistance`);
      } else if (value < 0) {
        throw new RangeError(`Expected value greater or equal to 0 for InfiniteScroller.unloadDistance`)
      } else {
        privates.unloadDistance = value;
        if (privates.unloadDistance <= privates.loadDistance) {
          privates.loadDistance = Math.max(0, privates.unloadDistance - INFINITE_SCROLLER_DEFAULT_LOAD_UNLOAD_DISTANCE);
        }
      }
    }
  }


  get contentLimitWheelStrategy(): IInfiniteScrollerContentLimitStrategy {
    return ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.wheel;
  }

  set contentLimitWheelStrategy(value: IInfiniteScrollerContentLimitStrategy | null) {
    InfiniteScrollerSetContentLimitStrategy(this, 'wheel', value);
  }

  get contentLimitTouchMoveStrategy(): IInfiniteScrollerContentLimitStrategy {
    return ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.touchMove;
  }

  set contentLimitTouchMoveStrategy(value: IInfiniteScrollerContentLimitStrategy | null) {
    InfiniteScrollerSetContentLimitStrategy(this, 'touchMove', value);
  }

  get contentLimitTouchInertiaStrategy(): IInfiniteScrollerContentLimitStrategy {
    return ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.touchInertia;
  }

  set contentLimitTouchInertiaStrategy(value: IInfiniteScrollerContentLimitStrategy | null) {
    InfiniteScrollerSetContentLimitStrategy(this, 'touchInertia', value);
  }

  get contentLimitMouseMiddleStrategy(): IInfiniteScrollerContentLimitStrategy {
    return ((this as unknown) as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].contentLimitStrategies.mouseMiddle;
  }

  set contentLimitMouseMiddleStrategy(value: IInfiniteScrollerContentLimitStrategy | null) {
    InfiniteScrollerSetContentLimitStrategy(this, 'mouseMiddle', value);
  }


  get firstElement(): HTMLElement | null {
    return InfiniteScrollerGetFirstChild(this);
  }

  get lastElement(): HTMLElement | null {
    return InfiniteScrollerGetLastChild(this);
  }

  elements(reversed?: boolean): IterableIterator<HTMLElement> {
    return InfiniteScrollerListChildren(this, reversed);
  }

  appendBefore(elements: HTMLElement[]): Promise<void> {
    return InfiniteScrollerAppendBeforeDeferred(this, elements);
  }

  appendAfter(elements: HTMLElement[]): Promise<void> {
    return InfiniteScrollerAppendAfterDeferred(this, elements);
  }

  clearElements(): void {
    InfiniteScrollerClearElements(this);
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
}


