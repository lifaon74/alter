import { TProgressFunction, TProgression } from '../types';

export type TNumericValueTransitionFunction = TProgressFunction<[], number>;

/**
 * Creates a transition from a number to another
 */
export function CreateNumericValueTransitionNotOptimized(
  origin: number,
  target: number,
): TNumericValueTransitionFunction {
  return (progression: TProgression): number => {
    return ((target - origin) * progression) + origin;
  };
}

export function CreateNumericValueTransition(
  origin: number,
  target: number,
): TNumericValueTransitionFunction {
  return (origin === target)
    ? (() => target)
    : CreateNumericValueTransitionNotOptimized(origin, target);
}

export function NumericValueEquals(a: number, b: number): boolean {
  return a === b;
}
