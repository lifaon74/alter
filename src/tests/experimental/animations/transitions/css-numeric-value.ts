import { ICSSNumericValue } from '../houdini';
import { TProgressFunction, TProgression } from '../types';

export type TCSSNumericValueTransitionFunction = TProgressFunction<[], ICSSNumericValue>;

/**
 * Creates a transition from a CSSNumericValue to another
 */
export function CreateCSSNumericValueTransitionNotOptimized(
  origin: ICSSNumericValue,
  target: ICSSNumericValue,
): TCSSNumericValueTransitionFunction {
  return (progression: TProgression): ICSSNumericValue => {
    return target.sub(origin).mul(progression).add(origin);
  };
}

export function CreateCSSNumericValueTransition(
  origin: ICSSNumericValue,
  target: ICSSNumericValue,
): TCSSNumericValueTransitionFunction {
  // return FastenTransition<[], ICSSNumericValue>(
  //   origin,
  //   target,
  //   CSSNumericValueEquals,
  //   CreateCSSNumericValueTransitionNotOptimized
  // );
  return origin.equals(target)
    ? (() => target)
    : CreateCSSNumericValueTransitionNotOptimized(origin, target);
}

export function CSSNumericValueEquals(a: ICSSNumericValue, b: ICSSNumericValue): boolean {
  return a.equals(b);
}
