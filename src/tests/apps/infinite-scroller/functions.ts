import { IInfiniteScroller, IInfiniteScrollerContentLimitStrategy } from './interfaces';
import {
  IInfiniteScrollerContentLimitStrategies, IInfiniteScrollerInternal, IInfiniteScrollerPrivate,
  INFINITE_SCROLLER_PRIVATE
} from './privates';
import {
  INFINITE_SCROLLER_COORDS_LENGTH, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY,
  INFINITE_SCROLLER_DIRECTION_CONSTANTS
} from './default-constants';
import { CyclicTypedVectorArray } from '../../../classes/cyclic/CyclicTypedVectorArray';
import { DecodeCSSTransformMatrix, EncodeCSSTransformMatrix, GetWheelDeltaInPx } from './helpers';
import { LoadElementsEvent } from './events/load-elements-event/implementation';
import { AttachNode, DestroyNodeSafe } from '../../../core/custom-node/node-state-observable/mutations';
import { UnloadElementsEvent } from './events/unload-elements-event/implementation';


/** FUNCTIONS **/

export function InfiniteScrollerSetContentLimitStrategy(
  instance: IInfiniteScroller,
  key: keyof IInfiniteScrollerContentLimitStrategies,
  strategy: IInfiniteScrollerContentLimitStrategy
): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  if ((strategy === null) || (strategy === void 0)) {
    privates.contentLimitStrategies[key] = INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY;
  } else {
    switch (strategy) {
      case 'ignore':
      case 'pause':
      case 'stop':
        privates.contentLimitStrategies[key] = strategy;
        break;
      default:
        throw new TypeError(`Expected 'ignore', 'ignore' or 'ignore' as contentLimit${ key }Strategy`);
    }
  }
}


/* SCROLL USING: */

const tempCoords: Float64Array = new Float64Array(INFINITE_SCROLLER_COORDS_LENGTH);
const tempVec3Float64Array = new Float64Array(3);

// -- TOUCH
export function InfiniteScrollerOnTouchStart(instance: IInfiniteScroller, event: TouchEvent): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  if (event.touches.length === 1) {
    event.preventDefault();

    const touch: Touch = event.touches[0];

    const touchPosition: number = touch[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
    privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(instance) - touchPosition;

    privates.wheelTarget = null;
    privates.touchCurrentPosition = touchPosition;

    privates.animationFunction = (): number => {
      const position: number = privates.animationInitialPosition + privates.touchCurrentPosition;

      if (privates.contentLimitStrategies.touchMove === 'ignore') {
        return position;
      } else {
        const endPosition: number = instance[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
          - privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
        if ((position >= 0) || (endPosition >= 0)) {
          if (privates.contentLimitStrategies.touchMove === 'stop') {
            privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(instance) - privates.touchCurrentPosition;
          }
          return 0;
        } else if (position <= endPosition) {
          if (privates.contentLimitStrategies.touchMove === 'stop') {
            privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(instance) - privates.touchCurrentPosition;
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

export function InfiniteScrollerOnTouchMove(instance: IInfiniteScroller, event: TouchEvent): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  const touch: Touch = event.touches[0];
  privates.touchCurrentPosition = touch[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
  WriteTouchCoordsFromTouch(privates.coords, touch);
}

export function InfiniteScrollerOnTouchEnd(instance: IInfiniteScroller, event: TouchEvent): void {
  if (event.touches.length === 1) {
    InfiniteScrollerOnTouchStart(instance, event);
  } else {
    const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

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
      privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(instance);
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
            const endPosition: number = instance[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
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

// -- WHEEL
export function InfiniteScrollerOnWheel(instance: IInfiniteScroller, event: WheelEvent): void {
  event.preventDefault();

  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  let distance: number = GetWheelDeltaInPx(-event.deltaY || -event.deltaX, event.deltaMode);
  privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(instance);
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
      const endPosition: number = instance[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
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

// -- MOUSE
export function InfiniteScrollerOnMouseDown(instance: IInfiniteScroller, event: MouseEvent): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  if (event.button === 1) { // middle button
    event.preventDefault();
    privates.mouseStartPosition = event[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
    privates.mouseCurrentPosition = privates.mouseStartPosition;
    privates.wheelTarget = null;

    privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(instance);
    let lastTime: number = performance.now();

    privates.animationFunction = (time: number): number => {
      const elapsedTime: number = time - lastTime;
      lastTime = time;
      const position: number = privates.animationInitialPosition - ((privates.mouseCurrentPosition - privates.mouseStartPosition) / elapsedTime) * 2;

      if (privates.contentLimitStrategies.mouseMiddle === 'ignore') {
        privates.animationInitialPosition = position;
        return position;
      } else {
        const endPosition: number = instance[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
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

export function InfiniteScrollerOnMouseMove(instance: IInfiniteScroller, event: MouseEvent): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  privates.mouseCurrentPosition = event[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].pointerPositionKey];
  event.preventDefault();
}

export function InfiniteScrollerOnMouseUp(instance: IInfiniteScroller, event: MouseEvent): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  privates.animationInitialPosition = InfiniteScrollerGetContainerTranslation(instance);
  privates.animationFunction = () => privates.animationInitialPosition;

  document.documentElement.style.removeProperty('cursor');
  privates.mouseMoveObserver.deactivate();
  privates.mouseUpObserver.deactivate();
}


/* READ/WRITE CONTAINER OFFSET */

/**
 * Reflects the current container position into the internal transform matrix (read its position)
 */
export function InfiniteScrollerUpdateTransformMatrix(instance: IInfiniteScroller): Float64Array {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  return DecodeCSSTransformMatrix(
    privates.transformMatrix,
    privates.containerStyle.getPropertyValue('transform')
  );
}

/**
 * Reflects the internal transform matrix into the container's style (updates its position)
 */
export function InfiniteScrollerApplyTransformMatrix(instance: IInfiniteScroller): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  privates.container.style.setProperty(
    'transform',
    EncodeCSSTransformMatrix(privates.transformMatrix)
  );
}

/**
 * Sets a specifics position (translation) for the container
 */
export function InfiniteScrollerSetContainerTranslation(instance: IInfiniteScroller, value: number): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  privates.transformMatrix[
    INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].transformMatrixIndex
    ] = Math.round(value);
  InfiniteScrollerApplyTransformMatrix(instance);
}

/**
 * Gets the actual position (translation) of the container
 */
export function InfiniteScrollerGetContainerTranslation(instance: IInfiniteScroller): number {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  InfiniteScrollerUpdateTransformMatrix(instance);
  return privates.transformMatrix[
    INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].transformMatrixIndex
    ];
}


/* ANIMATE */

/**
 * Mains animation loop:
 *  - calls the animationFunction
 *  - updates (load/unload) the child elements if required
 *  - updates the container position
 */
export function InfiniteScrollerLoop(instance: IInfiniteScroller): void {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];
  privates.requestAnimationFrameId = window.requestAnimationFrame(() => {
    let translation: number = privates.animationFunction(performance.now());
    translation = InfiniteScrollerContainerUpdate(instance, translation);
    InfiniteScrollerAnimationUpdate(instance, translation);
    InfiniteScrollerLoop(instance);
  });
}

/**
 * Alias of InfiniteScrollerSetContainerTranslation with default translation's value
 */
export function InfiniteScrollerAnimationUpdate(
  instance: IInfiniteScroller,
  translation: number = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].animationFunction(performance.now())
): void {
  InfiniteScrollerSetContainerTranslation(instance, translation);
}


/* LOAD/UNLOAD */

/**
 * Updates the child elements of the container if they reach some boundaries
 * and emits 'load-after' or 'load-before' events if enough space is available
 *
 * @param instance
 * @param translation => the position we would like to apply to the container
 * @return => the real translation to apply, after the child elements have been updated
 */
export function InfiniteScrollerContainerUpdate(instance: IInfiniteScroller, translation: number): number {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  const beforeLimit: number = -privates.loadDistance;
  const afterLimit: number = instance[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey] // computed infinite scroller size (width/height)
    - privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey] // computed container size (width/height)
    + privates.loadDistance;

  if (translation <= afterLimit) {
    // console.log('load-after', afterLimit - translation);
    instance.dispatchEvent(new LoadElementsEvent('load-after', {
      elementReference: instance.lastElement,
      distance: afterLimit - translation
    }));
  } else if (translation >= beforeLimit) {
    // console.log('load-before', translation - beforeLimit);
    instance.dispatchEvent(new LoadElementsEvent('load-before', {
      elementReference: instance.firstElement,
      distance: translation - beforeLimit
    }));
  }

  translation = InfiniteScrollerRemoveInvisibleElements(instance, translation);
  translation = InfiniteScrollerAppendElements(instance, translation);


  return translation;
}

/**
 * Checks if some child elements of the container should be removed
 */
export function InfiniteScrollerRemoveInvisibleElements(instance: IInfiniteScroller, translation: number): number {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  const beforeChunks: HTMLElement[] = [], afterChunks: HTMLElement[] = [];
  let beforeLength: number = 0, afterLength: number = 0;

  let chunk: HTMLElement | null, limit: number;

  // builds the list of chunks to remove before the unload limit
  limit = -translation - privates.unloadDistance;
  chunk = privates.container.firstElementChild as HTMLElement | null;
  while (chunk !== null) {
    const nextLength: number = beforeLength + chunk[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
    if (nextLength > limit) {
      break;
    } else {
      beforeChunks.push(chunk);
      beforeLength = nextLength;
    }
    chunk = chunk.nextElementSibling as HTMLElement | null;
  }

  // builds the list of chunks to remove after the unload limit
  limit = privates.container[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
    + translation
    - instance[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey]
    - privates.unloadDistance;
  chunk = privates.container.lastElementChild as HTMLElement | null;
  while (chunk !== null) {
    const nextLength: number = afterLength + chunk[INFINITE_SCROLLER_DIRECTION_CONSTANTS[privates.direction].containerComputedSizeKey];
    if (nextLength > limit) {
      break;
    } else {
      afterChunks.push(chunk);
      afterLength = nextLength;
    }
    chunk = chunk.previousElementSibling as HTMLElement | null;
  }

  // removes the chunks before the unload limit, updates the translation and emits an 'unload-before' event
  if (beforeChunks.length > 0) {
    const beforeRemovedElements: Element[] = [];

    for (let i = 0, l = beforeChunks.length; i < l; i++) {
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
    instance.dispatchEvent(new UnloadElementsEvent('unload-before', {
      elements: beforeRemovedElements
    }));

    const shift: number = beforeLength;
    privates.animationInitialPosition += shift;
    (privates.wheelTarget as number) += shift;
    translation += shift;
  }

  // removes the chunks after the unload limit and emits an 'unload-after' event
  if (afterChunks.length > 0) {
    const afterRemovedElements: Element[] = [];

    for (let i = 0, l = afterChunks.length; i < l; i++) {
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
    instance.dispatchEvent(new UnloadElementsEvent('unload-after', {
      elements: afterRemovedElements
    }));
  }

  return translation;
}

/**
 * Checks if some child elements are in the "append" queue. If so, appends them to the container by chunk.
 */
export function InfiniteScrollerAppendElements(instance: IInfiniteScroller, translation: number): number {
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  // BEFORE
  const beforeLength: number = privates.appendBeforeList.length;
  if (beforeLength > 0) {
    const beforeChunk: HTMLElement = InfiniteScrollerCreateChunk(instance);

    for (let i = 0; i < beforeLength; i++) {
      const { elements, resolve } = privates.appendBeforeList[i];
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
    (privates.wheelTarget as number) += shift;
    translation += shift;
  }

  // AFTER
  const afterLength: number = privates.appendAfterList.length;
  if (afterLength > 0) {
    const afterChunk: HTMLElement = InfiniteScrollerCreateChunk(instance);

    for (let i = 0; i < afterLength; i++) {
      const { elements, resolve } = privates.appendAfterList[i];
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

export function InfiniteScrollerCreateChunk(instance: IInfiniteScroller): HTMLElement {
  const chunk: HTMLElement = (instance.ownerDocument as Document).createElement('div');
  chunk.classList.add('chunk');
  return chunk;
}


/* ITERATE OVER CHILDREN */

export function * InfiniteScrollerGetChildren(instance: IInfiniteScroller): IterableIterator<HTMLElement> {
  const container: HTMLElement = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].container;
  let chunk: HTMLElement | null = container.firstElementChild as HTMLElement | null;
  while ((chunk !== null) && (chunk.parentElement === container)) {
    let node: HTMLElement | null = chunk.firstElementChild as HTMLElement | null;
    while ((node !== null) && (node.parentElement === chunk)) {
      yield node;
      node = node.nextElementSibling as HTMLElement | null;
    }

    chunk = chunk.nextElementSibling as HTMLElement | null;
  }
}

export function * InfiniteScrollerGetChildrenReversed(instance: IInfiniteScroller): IterableIterator<HTMLElement> {
  const container: HTMLElement = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE].container;
  let chunk: HTMLElement | null = container.lastElementChild as HTMLElement | null;
  while ((chunk !== null) && (chunk.parentElement === container)) {
    let node: HTMLElement | null = chunk.lastElementChild as HTMLElement | null;
    while ((node !== null) && (node.parentElement === chunk)) {
      yield node;
      node = node.previousElementSibling as HTMLElement | null;
    }

    chunk = chunk.previousElementSibling as HTMLElement | null;
  }
}


