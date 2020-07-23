import { IColor } from '../../../../misc/color/interfaces';
import { TProgressFunction, TProgression } from '../types';

export type TColorTransitionFunction = TProgressFunction<[], IColor>;

/**
 * Creates a transition from a color to another
 */
export function CreateColorTransitionNotOptimized(
  origin: IColor,
  target: IColor,
): TColorTransitionFunction {
  return (progression: TProgression): IColor => {
    return origin.mix(target, progression);
  };
}

export function CreateColorTransition(
  origin: IColor,
  target: IColor,
): TColorTransitionFunction {
  // return FastenTransition<[], IColor>(
  //   origin,
  //   target,
  //   ColorEquals,
  //   CreateColorTransitionNotOptimized
  // );
  return origin.equals(target)
    ? (() => target)
    : CreateColorTransitionNotOptimized(origin, target);
}

export function ColorEquals(a: IColor, b: IColor): boolean {
  return a.equals(b);
}
