import {
  EventsObservable, INotificationsObserver, IObservableContext, IObservableHook, Observable,
  ObservableIsFreshlyObserved, ObservableIsNotObserved
} from '@lifaon/observables';
import { ITouchFrameObservable, TTouchFrameObservableMatrix } from './interfaces';
import { ConstructClassWithPrivateMembers } from '@lifaon/class-factory';
import { IObservablePrivatesInternal } from '@lifaon/observables/types/core/observable/privates';
import { DOMMatrixIdentify } from '../../../misc/helpers/dom-matrix';

/** PRIVATES **/

export const TOUCH_FRAME_OBSERVABLE_PRIVATE = Symbol('touch-frame-observable-private');

export interface ITouchFrameObservablePrivate<TTarget extends EventTarget> {
  context: IObservableContext<TTouchFrameObservableMatrix>;
  target: TTarget;
  matrix: TTouchFrameObservableMatrix;
  touchStartObserver: INotificationsObserver<'touchstart', TouchEvent>;
  touchMoveObserver: INotificationsObserver<'touchmove', TouchEvent>;
  touchEndObserver: INotificationsObserver<'touchend', TouchEvent>;
}

export interface ITouchFrameObservablePrivatesInternal<TTarget extends EventTarget> extends IObservablePrivatesInternal<TTouchFrameObservableMatrix> {
  [TOUCH_FRAME_OBSERVABLE_PRIVATE]: ITouchFrameObservablePrivate<TTarget>;
}

export interface ITouchFrameObservableInternal<TTarget extends EventTarget> extends ITouchFrameObservable<TTarget>, ITouchFrameObservablePrivatesInternal<TTarget> {
}

/** CONSTRUCTOR **/


export function ConstructTouchFrameObservable<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
  context: IObservableContext<TTouchFrameObservableMatrix>,
  target: TTarget,
): void {
  ConstructClassWithPrivateMembers(instance, TOUCH_FRAME_OBSERVABLE_PRIVATE);
  const privates: ITouchFrameObservablePrivate<TTarget> = (instance as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE];

  privates.context = context;
  privates.target = target;
  privates.matrix = new DOMMatrix(); // identity

  const targetEventsObservable = new EventsObservable<GlobalEventHandlersEventMap>(target);
  const windowEventsObservable = new EventsObservable<WindowEventMap>(window);

  privates.touchStartObserver = targetEventsObservable
    .addListener('touchstart', (event: TouchEvent) => {
      TouchFrameObservableOnTouchStart<TTarget>(instance, event);
    });

  privates.touchMoveObserver = windowEventsObservable
    .addListener('touchmove', (event: TouchEvent) => {
      TouchFrameObservableOnTouchMove<TTarget>(instance, event);
    });

  privates.touchEndObserver = windowEventsObservable
    .addListener('touchend', (event: TouchEvent) => {
      TouchFrameObservableOnTouchEnd<TTarget>(instance, event);
    });
}


/** CONSTRUCTOR FUNCTIONS **/

export function TouchFrameObservableOnTouchStart<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
  event: TouchEvent,
): void {
  const privates: ITouchFrameObservablePrivate<TTarget> = (instance as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE];

  // if (event.touches.length === 1) {
  //   privates.coords.reset();
  //   WriteTouchCoordsFromTouch(privates.coords, event.touches[0]);
  //   privates.touchMoveObserver.activate();
  //   privates.touchEndObserver.activate();
  // } else {
  //   privates.touchMoveObserver.deactivate();
  //   privates.touchEndObserver.deactivate();
  // }
}

export function TouchFrameObservableOnTouchMove<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
  event: TouchEvent,
): void {
  // WriteTouchCoordsFromTouch((observable as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE].coords, event.touches[0]);
}

export function TouchFrameObservableOnTouchEnd<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
  event: TouchEvent,
): void {
  // if (event.touches.length === 1) {
  //   TouchFrameObservableOnTouchStart<TTarget>(observable, event);
  // } else {
  //   const privates: ITouchFrameObservablePrivate<TTarget> = (observable as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE];
  //
  //   privates.touchMoveObserver.deactivate();
  //   privates.touchEndObserver.deactivate();
  //
  //   if (privates.coords.readable() >= 6) {
  //     let positions: Float64Array = privates.coords.toTypedArray(tempCoords);
  //     const now: number = performance.now();
  //     if ((now - positions[0]) < 250) { // movement took a maximum of 250ms
  //       const lastIndex: number = positions.length - 3;
  //       positions[lastIndex] = now;
  //       const a: number = positions[lastIndex + 2] - positions[2]; // dy
  //       const b: number = positions[1] - positions[lastIndex + 1]; // -dx
  //       const d_ab: number = Math.sqrt(a * a + b * b);
  //
  //       if (d_ab > 150) { // we travel at least 150px
  //         let noise: number = 0;
  //
  //         // console.log(a, b, d_ab);
  //
  //         for (let i = 3; i < lastIndex; i += 3) {
  //           const d: number = Math.abs(a * (positions[i + 1] - positions[1]) + b * (positions[i + 2] - positions[2])) / d_ab;
  //           noise += d * d;
  //         }
  //
  //         noise /= (positions.length / 3) - 2;
  //
  //         if (noise < 100) {
  //           NotificationsObservableDispatch<ITouchFrameObservableKeyValueMap, 'swipe'>(observable, 'swipe', new TouchFrameEvent('swipe', {
  //             angle: Math.atan2(-a, -b),
  //             distance: d_ab
  //           }));
  //         }
  //       }
  //
  //     }
  //   }
  // }
}


export function TouchFrameObservableOnObserved<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
): void {
  if (ObservableIsFreshlyObserved(instance)) {
    (instance as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE].touchStartObserver.activate();
  }
}

export function TouchFrameObservableOnUnobserved<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
): void {
  if (ObservableIsNotObserved(instance)) {
    const privates: ITouchFrameObservablePrivate<TTarget> = (instance as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE];
    privates.touchStartObserver.deactivate();
    privates.touchMoveObserver.deactivate();
    privates.touchEndObserver.deactivate();
  }
}


/** METHODS **/

/* GETTERS/SETTERS **/

export function TouchFrameObservableGetTarget<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
): TTarget {
  return (instance as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE].target;
}

export function TouchFrameObservableGetMatrix<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
): TTouchFrameObservableMatrix {
  return (instance as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE].matrix;
}

/* METHODS */

export function TouchFrameObservableReset<TTarget extends EventTarget>(
  instance: ITouchFrameObservable<TTarget>,
): void {
  DOMMatrixIdentify((instance as ITouchFrameObservableInternal<TTarget>)[TOUCH_FRAME_OBSERVABLE_PRIVATE].matrix);
}

/** CLASS **/

export class TouchFrameObservable<TTarget extends EventTarget = EventTarget> extends Observable<TTouchFrameObservableMatrix> implements ITouchFrameObservable<TTarget> {
  constructor(target: TTarget) {
    let context: IObservableContext<TTouchFrameObservableMatrix>;
    super((_context: IObservableContext<TTouchFrameObservableMatrix>): IObservableHook<TTouchFrameObservableMatrix> => {
      context = _context;
      return {
        onObserved: () => {
          TouchFrameObservableOnObserved<TTarget>(this);
        },
        onUnobserved: () => {
          TouchFrameObservableOnUnobserved<TTarget>(this);
        }
      };
    });
    // @ts-ignore
    ConstructTouchFrameObservable<TTarget>(this, context, target);
  }

  get target(): TTarget {
    return TouchFrameObservableGetTarget<TTarget>(this);
  }

  get matrix(): TTouchFrameObservableMatrix {
    return TouchFrameObservableGetMatrix<TTarget>(this);
  }

  reset(): void {
    return TouchFrameObservableReset<TTarget>(this);
  }
}


