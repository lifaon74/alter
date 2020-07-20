import { TGenerateTransitionFunction, TTransitionFunction } from './types';
import { TProgression } from '../types';
import { TEqualFunction } from '../../../../misc/helpers/generic-types';


export function FastenTransition<T>(
  origin: T,
  target: T,
  equalFunction: TEqualFunction<T>,
  generateTransition: TGenerateTransitionFunction<T>,
): TTransitionFunction<T> {
  return FastenTransitionForSameTargetAndOrigin(
    origin,
    target,
    equalFunction,
    () => {
      return FastenTransitionForStartAndEndProgression(
        origin,
        target,
        generateTransition(),
      );
    }
  );
}

export function FastenTransitionForStartAndEndProgression<T>(
  origin: T,
  target: T,
  transition: TTransitionFunction<T>,
): TTransitionFunction<T> {
  return (progression: TProgression): T => {
    if (progression === 0) {
      return origin;
    } else if (progression === 1) {
      return target;
    } else {
      return transition(progression);
    }
  };
}

export function FastenTransitionForSameTargetAndOrigin<T>(
  origin: T,
  target: T,
  equalFunction: TEqualFunction<T>,
  generateTransition: TGenerateTransitionFunction<T>,
): TTransitionFunction<T> {
  return equalFunction(origin, target)
    ? (() => target)
    : generateTransition();
}





