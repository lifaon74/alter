import { IColor } from '../../../../misc/color/interfaces';
import { TTransitionFunction } from './types';
import { TProgression } from '../types';

/**
 * Creates a transition from a color to another
 */
export function CreateColorTransitionUnoptimized(
  origin: IColor,
  target: IColor,
): TTransitionFunction<IColor> {
  return (progression: TProgression): IColor => {
    return origin.mix(target, progression);
  };
}


export function CreateColorTransition(
  origin: IColor,
  target: IColor,
): TTransitionFunction<IColor> {
  return origin.equals(target)
    ? (() => target)
    : CreateColorTransitionUnoptimized(origin, target);
}

export function ColorEquals(a: IColor, b: IColor): boolean {
  return a.equals(b);
}
