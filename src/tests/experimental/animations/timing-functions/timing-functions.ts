import { CubicBezier } from './cubic-bezier';
import { TTimingFunction, TTimingFunctionName, TTimingFunctionOrName } from './types';
import {
  TGenericProgressFunction, TInferProgressFunctionArguments, TInferProgressFunctionReturns, TProgression
} from '../types';
import { TTransitionFunction } from '../transitions/types';

// https://css-tricks.com/emulating-css-timing-functions-javascript/

/** CREATE **/

/* LINEAR */

export function CreateLinearTimingFunction(): TTimingFunction {
  return (progression: TProgression) => progression;
}

export function CreateReverseTimingFunction(): TTimingFunction {
  return (progression: TProgression) => (1 - progression);
}

/* CUBIC BEZIER */

const CACHED_CUBIC_BEZIER = new Map<string, CubicBezier>();

export function CreateCubicBezierTimingFunction(x1: number, y1: number, x2: number, y2: number): TTimingFunction {
  const key: string = `${ x1 }-${ y1 }-${ x2 }-${ y2 }`;
  let bezier: CubicBezier = CACHED_CUBIC_BEZIER.get(key) as CubicBezier;
  if (bezier === void 0) {
    bezier = new CubicBezier(x1, y1, x2, x2);
    CACHED_CUBIC_BEZIER.set(key, bezier);
  }
  return (progression: TProgression) => {
    return bezier.getValue(progression);
  };
}

export function CreateEaseTimingFunction(): TTimingFunction {
  return CreateCubicBezierTimingFunction(0.25, 0.1, 0.25, 1);
}

export function CreateEaseInTimingFunction(): TTimingFunction {
  return CreateCubicBezierTimingFunction(0.42, 0, 1, 1);
}

export function CreateEaseOutTimingFunction(): TTimingFunction {
  return CreateCubicBezierTimingFunction(0, 0, 0.58, 1);
}

export function CreateEaseInOutTimingFunction(): TTimingFunction {
  return CreateCubicBezierTimingFunction(0.42, 0, 0.58, 1);
}


/** CONVERT **/

export function TimingFunctionNameToTimingFunction(name: TTimingFunctionName): TTimingFunction {
  switch (name) {
    case 'linear':
      return CreateLinearTimingFunction();
    case 'ease':
      return CreateEaseTimingFunction();
    case 'ease-in':
      return CreateEaseInTimingFunction();
    case 'ease-out':
      return CreateEaseOutTimingFunction();
    case 'ease-in-out':
      return CreateEaseInOutTimingFunction();
    default:
      throw new TypeError(`Unknown timing function's name '${ name }'`);
  }
}

export function TimingFunctionOrNameToTimingFunction(input: TTimingFunctionOrName): TTimingFunction {
  return (typeof input === 'function')
    ? input
    : TimingFunctionNameToTimingFunction(input);
}

/** APPLY **/

export function ApplyTimingFunction<TCallback extends TGenericProgressFunction>(
  timingFunction: TTimingFunction,
  callback: TCallback,
): TCallback {
  return ((progression: TProgression, ...args: any[]): any => {
    return callback(timingFunction(progression), ...args);
  }) as TCallback;
}
