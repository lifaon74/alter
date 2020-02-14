import { IInfiniteScroller } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import {
  IInfiniteScrollerContentLimitStrategies, IInfiniteScrollerInternal, IInfiniteScrollerPrivate,
  INFINITE_SCROLLER_PRIVATE
} from './privates';
import {
  INFINITE_SCROLLER_COORDS_LENGTH, INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY,
  INFINITE_SCROLLER_DEFAULT_DIRECTION, INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE,
  INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE
} from './default-constants';
import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { EventsObservable, IEventsObservable } from '@lifaon/observables';
import { CyclicTypedVectorArray } from '../../../classes/cyclic/CyclicTypedVectorArray';
import { InfiniteScrollerSetDirection } from './implementation';
import {
  InfiniteScrollerOnMouseDown, InfiniteScrollerOnMouseMove, InfiniteScrollerOnMouseUp,
  InfiniteScrollerOnTouchEnd,
  InfiniteScrollerOnTouchMove,
  InfiniteScrollerOnTouchStart, InfiniteScrollerOnWheel, InfiniteScrollerUpdateTransformMatrix
} from './functions';

/** CONSTRUCTOR **/

export function ConstructInfiniteScroller(instance: IInfiniteScroller): void {
  ConstructClassWithPrivateMembers(instance, INFINITE_SCROLLER_PRIVATE);
  const privates: IInfiniteScrollerPrivate = (instance as IInfiniteScrollerInternal)[INFINITE_SCROLLER_PRIVATE];

  if (instance.ownerDocument === null) {
    throw new Error(`InfiniteScroller must have a document`);
  }

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
  privates.container = instance.ownerDocument.createElement('div');
  privates.container.classList.add('container');

  privates.containerStyle = window.getComputedStyle(privates.container);
  AttachNode(privates.container, instance);

  privates.transformMatrix = new Float64Array(9);
  InfiniteScrollerUpdateTransformMatrix(instance);


  privates.requestAnimationFrameId = null;
  privates.animationInitialPosition = 0;
  privates.animationFunction = () => privates.animationInitialPosition;

  privates.appendBeforeList = [];
  privates.appendAfterList = [];
  privates.clearList = [];

  const instanceEventsObservable: IEventsObservable<HTMLElementEventMap> = new EventsObservable<HTMLElementEventMap>(instance);
  const windowEventsObservable: IEventsObservable<WindowEventMap> = new EventsObservable<WindowEventMap>(window);

  /** WHEEL **/
  privates.wheelTarget = null;

  privates.wheelObserver = instanceEventsObservable
    .addListener<'wheel'>('wheel', (event: WheelEvent) => {
      InfiniteScrollerOnWheel(instance, event);
    });


  /** TOUCH **/
  privates.touchCurrentPosition = 0;
  privates.coords = new CyclicTypedVectorArray<Float64Array>(new Float64Array(INFINITE_SCROLLER_COORDS_LENGTH), 3);


  privates.touchStartObserver = instanceEventsObservable
    .addListener<'touchstart'>('touchstart', (event: TouchEvent) => {
      InfiniteScrollerOnTouchStart(instance, event);
    });

  privates.touchMoveObserver = windowEventsObservable
    .addListener<'touchmove'>('touchmove', (event: TouchEvent) => {
      InfiniteScrollerOnTouchMove(instance, event);
    });

  privates.touchEndObserver = windowEventsObservable
    .addListener<'touchend'>('touchend', (event: TouchEvent) => {
      InfiniteScrollerOnTouchEnd(instance, event);
    });


  /** MOUSE **/
  privates.mouseStartPosition = 0;
  privates.mouseCurrentPosition = 0;

  privates.mouseDownObserver = instanceEventsObservable
    .addListener<'mousedown'>('mousedown', (event: MouseEvent) => {
      InfiniteScrollerOnMouseDown(instance, event);
    });

  privates.mouseMoveObserver = windowEventsObservable
    .addListener<'mousemove'>('mousemove', (event: MouseEvent) => {
      InfiniteScrollerOnMouseMove(instance, event);
    });

  privates.mouseUpObserver = windowEventsObservable
    .addListener<'mouseup'>('mouseup', (event: MouseEvent) => {
      InfiniteScrollerOnMouseUp(instance, event);
    });


  InfiniteScrollerSetDirection(instance, INFINITE_SCROLLER_DEFAULT_DIRECTION);
}
