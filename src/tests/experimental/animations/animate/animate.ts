import { TAnimationFunction, THTMLElementsAnimationFunction } from '../animations/types';
import { NormalizeProgression } from '../functions';
import { TAnimateFunction } from './types';
import {
  $delay, CancellablePromise, IAdvancedAbortSignal, ICancellablePromise, ICancellablePromiseOptions,
  IsAdvancedAbortSignal, TNativePromiseLikeOrValue
} from '@lifaon/observables';
import { IsObject } from '../../../../misc/helpers/is/IsObject';

// export interface ICreateAnimateFunctionOptions {
//   // loop?: boolean;
//   reverse?: boolean;
// }

/**
 * Creates an <animate function> for an <animation> with a specific 'duration': when called, it runs <animation>
 */
export function CreateAnimateFunctionFromAnimation<TArgs extends any[]>(
  animation: TAnimationFunction<TArgs>,
  duration: number,
): TAnimateFunction<TArgs> {
  return (options?: ICancellablePromiseOptions, ...args: TArgs): ICancellablePromise<void> => {

    return new CancellablePromise<void>((
      resolve: (value?: TNativePromiseLikeOrValue<void>) => void,
      reject: (reason?: any) => void,
      signal: IAdvancedAbortSignal,
    ) => {
      const startTime: number = Date.now();
      let initialized: boolean = false;
      let handle: any;

      const clear = () => {
        abortListener.deactivate();
      };

      const loop = () => {
        if (!initialized) {
          initialized = true;
          animation('start', ...args);
        }

        const progress: number = NormalizeProgression((Date.now() - startTime) / duration);

        animation(progress, ...args);

        if (progress < 1) {
          handle = requestAnimationFrame(loop);
        } else {
          animation('end', ...args);
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

/**
 * Creates an <animate function> for an <animation> (expecting a list of HTMLElements) with a specific 'duration' and list of elements
 */
export function CreateAnimateFunctionFromHTMLElementsAnimationWithKnownElements(
  animation: THTMLElementsAnimationFunction,
  duration: number,
  elements: ArrayLike<HTMLElement>,
): TAnimateFunction<[]> {
  const _animation: TAnimateFunction<[ArrayLike<HTMLElement>]> = CreateAnimateFunctionFromAnimation(animation, duration);
  return (options?: ICancellablePromiseOptions) => {
    return _animation(options, elements);
  };
}

/**
 * Creates an <animate function> for an <animation> (expecting a list of HTMLElements) with a specific 'duration' and css selector for the elements
 */
export function CreateAnimateFunctionFromHTMLElementsAnimationWithCSSSelector(
  animation: THTMLElementsAnimationFunction,
  duration: number,
  selector: string,
  parentElement: ParentNode = document,
): TAnimateFunction<[]> {
  const _animation: TAnimateFunction<[ArrayLike<HTMLElement>]> = CreateAnimateFunctionFromAnimation(animation, duration);
  return (options?: ICancellablePromiseOptions) => {
    return _animation(options, parentElement.querySelectorAll(selector));
  };
}

/**
 * Creates an <animate function> for an <animation> (expecting a list of HTMLElements) with a specific 'duration' and list of elements or a selctor
 */
export function CreateAnimateFunctionFromHTMLElementsAnimation(
  animation: THTMLElementsAnimationFunction,
  duration: number,
  elements: ArrayLike<HTMLElement> | string,
): TAnimateFunction<[]> {
  return (typeof elements === 'string')
     ? CreateAnimateFunctionFromHTMLElementsAnimationWithCSSSelector(animation, duration, elements)
     : CreateAnimateFunctionFromHTMLElementsAnimationWithKnownElements(animation, duration, elements);
}

/*-------------------------*/

/**
 * Creates an <animate function> used to delay some execution
 */
export function CreateDelayAnimateFunction(timeout: number): TAnimateFunction<[]> {
  return (options: ICancellablePromiseOptions = {}) => {
    return $delay(timeout, options);
  };
}

export function CreateLoopAnimateFunction<TArgs extends any[]>(
  animateFunction: TAnimateFunction<TArgs>
): TAnimateFunction<TArgs> {
  return (options?: ICancellablePromiseOptions, ...args: TArgs) => {
    const loop = (signal: IAdvancedAbortSignal): ICancellablePromise<void> => {
      return animateFunction({ signal }, ...args)
        .then((result: void, signal: IAdvancedAbortSignal) => {
          return loop(signal);
        });
    }
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
export function CreateParallelAnimateFunction<TArgs extends any[]>(
  animateFunctions: TAnimateFunction<TArgs>[],
): TAnimateFunction<TArgs> {
  return (options?: ICancellablePromiseOptions, ...args: TArgs) => {
    return CancellablePromise.all(
      animateFunctions.map((animate: TAnimateFunction<TArgs>) => {
        return (signal: IAdvancedAbortSignal) => animate({ signal }, ...args);
      })
    ).then(() => {
    });
  };
}

/**
 * Creates an <animate function> which runs in sequence many <animate functions>
 */
export function CreateSequentialAnimateFunction<TArgs extends any[]>(
  animateFunctions: TAnimateFunction<TArgs>[],
): TAnimateFunction<TArgs> {
  return (options?: ICancellablePromiseOptions, ...args: TArgs) => {
    return animateFunctions.reduce((promise: ICancellablePromise<void>, animateFunction: TAnimateFunction<TArgs>) => {
      return promise.then((value: void, signal: IAdvancedAbortSignal) => animateFunction({ signal }, ...args));
    }, CancellablePromise.resolve<void>(void 0, options));
  };
}

/*-----------------------*/



// export interface TAnimationWithWeightObject<TArgs extends any[]> {
//   animation: TAnimateFunction<TArgs>;
//   weight: number;
// }
//
//
// export type TAnimationWithWeightTuple<TArgs extends any[]> = [TAnimateFunction<TArgs>, number];
//
// export type TAnimationWithWeight<TArgs extends any[]> = TAnimationWithWeightObject<TArgs> | TAnimationWithWeightTuple<TArgs>;
//
//
// export interface TNormalizedAnimationWithWeight<TArgs extends any[]> extends TAnimationWithWeightObject<TArgs> {
//   startProgression: number;
//   endProgression: number;
// }
//
// export function NormalizeAnimationWithWeightIterable<TArgs extends any[]>(
//   animationsWithWeight: Iterable<TAnimationWithWeight<TArgs>>
// ): TNormalizedAnimationWithWeight<TArgs>[] {
//
//   const preNormalizedAnimationsWithWeight: TAnimationWithWeightObject<TArgs>[] = Array.from(
//     animationsWithWeight,
//     (animationWithWeight: TAnimationWithWeight<TArgs>, index: number) => {
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
//   const totalWeight: number = preNormalizedAnimationsWithWeight.reduce((totalWeight: number, animationWithWeight: TAnimationWithWeightObject<TArgs>, index: number) => {
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
//   return preNormalizedAnimationsWithWeight.map((animationWithWeight: TAnimationWithWeightObject<TArgs>) => {
//     const weight: number = animationWithWeight.weight / totalWeight;
//     const endProgression: number = startProgression + weight;
//     const normalizedAnimationWithWeight: TNormalizedAnimationWithWeight<TArgs> =  {
//       animation: animationWithWeight.animation,
//       weight,
//       startProgression,
//       endProgression,
//     };
//     return normalizedAnimationWithWeight;
//   });
// }
//
// export function CreateSequentialAnimateFunctionFromAnimationsWithWeight<TArgs extends any[]>(
//   animationsWithWeight: Iterable<TAnimationWithWeight<TArgs>>
// ): TAnimateFunction<TArgs> {
//   const normalizedAnimationsWithWeight: TNormalizedAnimationWithWeight<TArgs>[] = NormalizeAnimationWithWeightIterable<TArgs>(animationsWithWeight);
//
//   return (options?: ICancellablePromiseOptions, ...args: TArgs) => ICancellablePromise<void> {
//
//   };
// }


/*--*/

export interface TAnimationWithDurationObject<TArgs extends any[]> {
  animation: TAnimationFunction<TArgs>;
  duration: number;
}


export type TAnimationWithDurationTuple<TArgs extends any[]> = [TAnimationFunction<TArgs>, number];

export type TAnimationWithDuration<TArgs extends any[]> = TAnimationWithDurationObject<TArgs> | TAnimationWithDurationTuple<TArgs>;

export function NormalizeAnimationWithDurationIterable<TArgs extends any[]>(
  animationsWithDuration: Iterable<TAnimationWithDuration<TArgs>>
): TAnimationWithDurationObject<TArgs>[] {
  return Array.from(
    animationsWithDuration,
    (animationWithDuration: TAnimationWithDuration<TArgs>, index: number) => {
      if (Array.isArray(animationWithDuration)) {
        return {
          animation: animationWithDuration[0],
          duration: animationWithDuration[1],
        };
      } else if (IsObject(animationWithDuration)) {
        return animationWithDuration;
      } else {
        throw new TypeError(`Expected TAnimationWithDuration at index ${ index }`);
      }
    }
  );
}

export function CreateSequentialAnimateFunctionFromAnimationsWithDuration<TArgs extends any[]>(
  animationsWithDuration: Iterable<TAnimationWithDuration<TArgs>>
): TAnimateFunction<TArgs> {
  return CreateSequentialAnimateFunction<TArgs>(
    NormalizeAnimationWithDurationIterable<TArgs>(animationsWithDuration)
      .map((normalizedAnimationWithDuration: TAnimationWithDurationObject<TArgs>) => {
        return CreateAnimateFunctionFromAnimation<TArgs>(normalizedAnimationWithDuration.animation, normalizedAnimationWithDuration.duration);
      })
  );
}


/*--*/



// export function animate_seq_states<TArgs extends any[]>(
//   states: TStyleState[],
// ): TAnimateFunction<TArgs> {
//   const length: number = states.length;
//
//   if (length < 2) {
//     throw new Error(`Min 2 states required`);
//   } else {
//     const animations: any[] = [];
//     for (let i = 1; i < length; i++) {
//       animations.push();
//     }
//   }
//
//   // [
//   //   animate(animation(showFront, showRight), duration),
//   //   animate(animation(showRight, showRight), duration),
//   // ])
// }






