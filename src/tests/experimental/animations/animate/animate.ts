import { TAnimationFunction, THTMLElementsAnimationFunction } from '../animations/types';
import { NormalizeProgression } from '../functions';
import { TAnimateFunction } from './types';
import {
  $delay, CancellablePromise, IAdvancedAbortSignal, ICancellablePromise, ICancellablePromiseOptions,
  TNativePromiseLikeOrValue
} from '@lifaon/observables';

// export interface ICreateAnimateFunctionOptions {
//   // loop?: boolean;
//   reverse?: boolean;
// }

/**
 * When called, execute 'animation' with a specific 'duration'
 */
export function CreateAnimateFunction<TArgs extends any[]>(
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


export function CreateHTMLElementsAnimateFunctionWithKnownElements(
  animation: THTMLElementsAnimationFunction,
  duration: number,
  elements: ArrayLike<HTMLElement>,
): TAnimateFunction<any[]> {
  const _animation: TAnimateFunction<[ArrayLike<HTMLElement>]> = CreateAnimateFunction(animation, duration);
  return (options?: ICancellablePromiseOptions) => {
    return _animation(options, elements);
  };
}

/**
 * Creates an <animate function> used to delay some execution
 */
export function CreateDelayAnimateFunction(timeout: number): TAnimateFunction<any[]> {
  return (options: ICancellablePromiseOptions = {}) => {
    return $delay(timeout, options);
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
