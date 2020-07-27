import { TAnimationFunction, TAnimationFunctionRequiringFutureHTMLElements } from '../animations/types';
import { NormalizeProgression } from '../functions';
import {
  IReduceAnimateFunctionOptions, TAnimateFunction, TAnimateFunctionRequiringFutureDuration,
  TAnimateFunctionRequiringFutureDurationAndHTMLElements, TAnimateFunctionRequiringFutureHTMLElements,
  TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult,
  TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult
} from './types';
import {
  $delay, CancellablePromise, IAdvancedAbortSignal, ICancellablePromise, ICancellablePromiseOptions,
  IsAdvancedAbortSignal, TNativePromiseLikeOrValue
} from '@lifaon/observables';
import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { HTMLElementArray, TProgressionSpecialState } from '../types';

// export interface ICreateAnimateFunctionOptions {
//   // loop?: boolean;
//   reverse?: boolean;
// }

/************************* FROM ANIMATION *************************/


/**
 * Creates an <animate function> for an <animation>: when called with a 'duration', it runs <animation>
 */
export function CreateAnimateFunctionFromAnimationRequiringFutureDuration<GArgs extends any[]>(
  animation: TAnimationFunction<GArgs>,
): TAnimateFunctionRequiringFutureDuration<GArgs> {
  return (
    options: ICancellablePromiseOptions | undefined,
    duration: number,
    ...args: GArgs
  ): ICancellablePromise<void> => {

    return new CancellablePromise<void>((
      resolve: (value?: TNativePromiseLikeOrValue<void>) => void,
      reject: (reason?: any) => void,
      signal: IAdvancedAbortSignal,
    ) => {
      if (duration < 0) {
        throw new RangeError(`Expected 'duration' in the range [0, +Infinity[`);
      }

      const startTime: number = Date.now();
      let initialized: boolean = false;
      let handle: any;

      const clear = () => {
        abortListener.deactivate();
      };

      const loop = () => {
        if (!initialized) {
          initialized = true;
          animation(TProgressionSpecialState.START, ...args);
        }

        const progress: number = NormalizeProgression((Date.now() - startTime) / duration);

        animation(progress, ...args);

        if (progress < 1) {
          handle = requestAnimationFrame(loop);
        } else {
          animation(TProgressionSpecialState.END, ...args);
          clear();
          resolve();
        }
      };

      handle = requestAnimationFrame(loop);

      const abortListener = signal
        .addListener('abort', () => {
          animation(0, ...args);
          clear();
          cancelAnimationFrame(handle);
        }).activate();

    }, options);
  };
}


export function CreateAndReduceAnimateFunctionRequiringFutureHTMLElementsFromAnimation<GArgs extends any[],
  GOptions extends IReduceAnimateFunctionOptions>(
  animation: TAnimationFunctionRequiringFutureHTMLElements<GArgs>,
  options?: GOptions,
): TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult<GArgs, GOptions> {
  return ReduceAnimateFunctionRequiringFutureDurationAndHTMLElements<GArgs, GOptions>(
    CreateAnimateFunctionFromAnimationRequiringFutureDuration<[HTMLElementArray, ...GArgs]>(animation),
    options,
  );
}


/************************* FIX ARGUMENTS *************************/

/**
 * Simplifies an <animate function> by fixing some of it's arguments like a duration or a list of elements
 */
export function ReduceAnimateFunctionRequiringFutureDurationAndHTMLElements<GArgs extends any[],
  GOptions extends IReduceAnimateFunctionOptions>(
  animateFunction: TAnimateFunctionRequiringFutureDurationAndHTMLElements<GArgs>,
  options?: GOptions,
): TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult<GArgs, GOptions> {

  let _animateFunction: any;

  const duration: number | undefined = (typeof options?.duration === 'number')
    ? options.duration
    : void 0;

  const elements: HTMLElementArray | undefined = Array.isArray(options?.elements)
    ? (options as GOptions).elements
    : void 0;

  const selector: string | undefined = (typeof options?.selector === 'string')
    ? options.selector
    : void 0;

  const parentElement: ParentNode = (options?.parentElement === void 0)
    ? document
    : options.parentElement;

  if (duration === void 0) {
    if (elements === void 0) {
      if (selector === void 0) {
        _animateFunction = animateFunction;
      } else {
        _animateFunction = (options: ICancellablePromiseOptions | undefined, duration: number, ...args: GArgs): ICancellablePromise<void> => {
          return animateFunction(options, duration, parentElement.querySelectorAll(selector), ...args);
        };
      }
    } else {
      if (selector === void 0) {
        _animateFunction = (options: ICancellablePromiseOptions | undefined, duration: number, ...args: GArgs): ICancellablePromise<void> => {
          return animateFunction(options, duration, elements, ...args);
        };
      } else {
        throw new Error(`Cannot have simultaneously 'elements' and 'selector' on options`);
      }
    }
  } else {
    if (elements === void 0) {
      if (selector === void 0) {
        _animateFunction = (options: ICancellablePromiseOptions | undefined, elements: HTMLElementArray, ...args: GArgs): ICancellablePromise<void> => {
          return animateFunction(options, duration, elements, ...args);
        };
      } else {
        _animateFunction = (options: ICancellablePromiseOptions | undefined, ...args: GArgs): ICancellablePromise<void> => {
          return animateFunction(options, duration, parentElement.querySelectorAll(selector), ...args);
        };
      }
    } else {
      if (selector === void 0) {
        _animateFunction = (options: ICancellablePromiseOptions | undefined, ...args: GArgs): ICancellablePromise<void> => {
          return animateFunction(options, duration, elements, ...args);
        };
      } else {
        throw new Error(`Cannot have simultaneously 'elements' and 'selector' on options`);
      }
    }
  }

  return _animateFunction;
}


export function SetDurationOfAnimateFunctionRequiringFutureDuration<GArgs extends any[]>(
  animateFunction: TAnimateFunctionRequiringFutureDuration<GArgs>,
  duration: number,
): TAnimateFunction<GArgs> {
  return (options?: ICancellablePromiseOptions, ...args: GArgs): ICancellablePromise<void> => {
    return animateFunction(options, duration, ...args);
  };
}

export function SetElementsOfAnimateFunctionRequiringFutureElements<GArgs extends any[]>(
  animateFunction: TAnimateFunctionRequiringFutureHTMLElements<GArgs>,
  elements: HTMLElementArray,
): TAnimateFunction<GArgs> {
  return (options?: ICancellablePromiseOptions, ...args: GArgs): ICancellablePromise<void> => {
    return animateFunction(options, elements, ...args);
  };
}

export function SetElementsAsQuerySelectorOfAnimateFunctionRequiringFutureElements<GArgs extends any[]>(
  animateFunction: TAnimateFunctionRequiringFutureHTMLElements<GArgs>,
  selector: string,
  parentElement: ParentNode = document
): TAnimateFunction<GArgs> {
  return (options?: ICancellablePromiseOptions, ...args: GArgs): ICancellablePromise<void> => {
    return animateFunction(options, parentElement.querySelectorAll(selector), ...args);
  };
}


/************************* FROM OTHER ANIMATE FUNCTIONS *************************/

/**
 * Creates an <animate function> used to delay some execution
 */
export function CreateDelayAnimateFunction(timeout: number): TAnimateFunction<[]> {
  return (options: ICancellablePromiseOptions = {}) => {
    return $delay(timeout, options);
  };
}

/**
 * Creates an <animate function> which runs in loop an <animate function>
 */
export function CreateLoopAnimateFunction<GArgs extends any[]>(
  animateFunction: TAnimateFunction<GArgs>
): TAnimateFunction<GArgs> {
  return (options?: ICancellablePromiseOptions, ...args: GArgs) => {
    const loop = (signal: IAdvancedAbortSignal): ICancellablePromise<void> => {
      return animateFunction({ signal }, ...args)
        .then((result: void, signal: IAdvancedAbortSignal) => {
          return loop(signal);
        });
    };
    if (IsObject(options) && IsAdvancedAbortSignal((options as ICancellablePromiseOptions).signal)) {
      return loop((options as ICancellablePromiseOptions).signal as IAdvancedAbortSignal);
    } else {
      throw new Error(`You must provide an AdvancedAbortSignal for this looping animate function`);
    }
  };
}

/**
 * Creates an <animate function> which runs in parallel many <animate functions>
 */
export function CreateParallelAnimateFunction<GArgs extends any[]>(
  animateFunctions: TAnimateFunction<GArgs>[],
): TAnimateFunction<GArgs> {
  return (options?: ICancellablePromiseOptions, ...args: GArgs) => {
    return CancellablePromise.all(
      animateFunctions.map((animate: TAnimateFunction<GArgs>) => {
        return (signal: IAdvancedAbortSignal) => animate({ signal }, ...args);
      })
    ).then(() => {
    });
  };
}

/**
 * Creates an <animate function> which runs in sequence many <animate functions>
 */
export function CreateSequentialAnimateFunction<GArgs extends any[]>(
  animateFunctions: TAnimateFunction<GArgs>[],
): TAnimateFunction<GArgs> {
  return (options?: ICancellablePromiseOptions, ...args: GArgs) => {
    return animateFunctions.reduce((promise: ICancellablePromise<void>, animateFunction: TAnimateFunction<GArgs>) => {
      return promise.then((value: void, signal: IAdvancedAbortSignal) => animateFunction({ signal }, ...args));
    }, CancellablePromise.resolve<void>(void 0, options));
  };
}


export function CreateSequentialWeightedAnimateFunctionWithFutureDuration<GArgs extends any[]>(
  weightedAnimateFunctions: [TAnimateFunctionRequiringFutureDuration<GArgs>, number][],
): TAnimateFunctionRequiringFutureDuration<GArgs> {
  return (options: ICancellablePromiseOptions | undefined, duration: number, ...args: GArgs) => {
    return weightedAnimateFunctions.reduce(
      (
        promise: ICancellablePromise<void>,
        [animateFunction, weight]: [TAnimateFunctionRequiringFutureDuration<GArgs>, number],
      ) => {
        return promise.then((value: void, signal: IAdvancedAbortSignal) => {
          return animateFunction({ signal }, weight * duration, ...args);
        });
      },
      CancellablePromise.resolve<void>(void 0, options)
    );
  };
}

/*-----------------------*/


// export interface TAnimationWithWeightObject<GArgs extends any[]> {
//   animation: TAnimateFunction<GArgs>;
//   weight: number;
// }
//
//
// export type TAnimationWithWeightTuple<GArgs extends any[]> = [TAnimateFunction<GArgs>, number];
//
// export type TAnimationWithWeight<GArgs extends any[]> = TAnimationWithWeightObject<GArgs> | TAnimationWithWeightTuple<GArgs>;
//
//
// export interface TNormalizedAnimationWithWeight<GArgs extends any[]> extends TAnimationWithWeightObject<GArgs> {
//   startProgression: number;
//   endProgression: number;
// }
//
// export function NormalizeAnimationWithWeightIterable<GArgs extends any[]>(
//   animationsWithWeight: Iterable<TAnimationWithWeight<GArgs>>
// ): TNormalizedAnimationWithWeight<GArgs>[] {
//
//   const preNormalizedAnimationsWithWeight: TAnimationWithWeightObject<GArgs>[] = Array.from(
//     animationsWithWeight,
//     (animationWithWeight: TAnimationWithWeight<GArgs>, index: number) => {
//       if (Array.isArray(animationWithWeight)) {
//         return {
//           animation: animationWithWeight[0],
//           weight: animationWithWeight[1],
//         };
//       } else if (IsObject(animationWithWeight)) {
//         return animationWithWeight;
//       } else {
//         throw new TypeError(`Expected TAnimationWithWeight at index ${ index }`);
//       }
//     }
//   );
//
//   const totalWeight: number = preNormalizedAnimationsWithWeight.reduce((totalWeight: number, animationWithWeight: TAnimationWithWeightObject<GArgs>, index: number) => {
//     if (Number.isFinite(totalWeight) && (totalWeight >= 0)) {
//       return totalWeight + animationWithWeight.weight;
//     } else {
//       throw new RangeError(`weight must be in the range [0, Infinity[ at index ${ index }`);
//     }
//   }, 0);
//
//   if (Number.isFinite(totalWeight)) {
//     throw new RangeError(`totalWeight is infinite`);
//   }
//
//   let startProgression: number = 0;
//   return preNormalizedAnimationsWithWeight.map((animationWithWeight: TAnimationWithWeightObject<GArgs>) => {
//     const weight: number = animationWithWeight.weight / totalWeight;
//     const endProgression: number = startProgression + weight;
//     const normalizedAnimationWithWeight: TNormalizedAnimationWithWeight<GArgs> =  {
//       animation: animationWithWeight.animation,
//       weight,
//       startProgression,
//       endProgression,
//     };
//     return normalizedAnimationWithWeight;
//   });
// }
//
// export function CreateSequentialAnimateFunctionFromAnimationsWithWeight<GArgs extends any[]>(
//   animationsWithWeight: Iterable<TAnimationWithWeight<GArgs>>
// ): TAnimateFunction<GArgs> {
//   const normalizedAnimationsWithWeight: TNormalizedAnimationWithWeight<GArgs>[] = NormalizeAnimationWithWeightIterable<GArgs>(animationsWithWeight);
//
//   return (options?: ICancellablePromiseOptions, ...args: GArgs) => ICancellablePromise<void> {
//
//   };
// }










