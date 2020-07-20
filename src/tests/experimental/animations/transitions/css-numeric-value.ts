import { ICSSNumericValue } from '../houdini';
import { TTransitionFunction } from './types';
import { TProgression } from '../types';

/**
 * Creates a transition from a CSSNumericValue to another
 */
export function CreateCSSNumericValueTransitionUnOptimized(
  origin: ICSSNumericValue,
  target: ICSSNumericValue,
): TTransitionFunction<ICSSNumericValue> {
  return (progression: TProgression): ICSSNumericValue => {
    return target.sub(origin).mul(progression).add(origin);
  };
}

export function CreateCSSNumericValueTransition(
  origin: ICSSNumericValue,
  target: ICSSNumericValue,
): TTransitionFunction<ICSSNumericValue> {
  return origin.equals(target)
    ? (() => target)
    : CreateCSSNumericValueTransitionUnOptimized(origin, target);
}

export function CSSNumericValueEquals(a: ICSSNumericValue, b: ICSSNumericValue): boolean {
  return a.equals(b);
}
