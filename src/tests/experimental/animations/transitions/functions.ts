import { TEqualFunction } from '../../../../misc/helpers/generic-types';
import { TProgressFunction, TProgression } from '../types';


export type TGenerateTransition<GProgressFunctionArgs extends any[], GValue> = (
  origin: GValue,
  target: GValue,
) => TProgressFunction<GProgressFunctionArgs, GValue>

export function FastenTransition<GProgressFunctionArgs extends any[], GValue>(
  origin: GValue,
  target: GValue,
  equalFunction: TEqualFunction<GValue>,
  generateTransition: TGenerateTransition<GProgressFunctionArgs, GValue>,
): TProgressFunction<GProgressFunctionArgs, GValue> {
  return FastenTransitionForSameTargetAndOrigin<GProgressFunctionArgs, GValue>(
    origin,
    target,
    equalFunction,
    () => {
      return FastenTransitionForStartAndEndProgression<GProgressFunctionArgs, GValue>(
        origin,
        target,
        generateTransition(origin, target),
      );
    }
  );
}

export function FastenTransitionForStartAndEndProgression<GProgressFunctionArgs extends any[], GValue>(
  origin: GValue,
  target: GValue,
  transition: TProgressFunction<GProgressFunctionArgs, GValue>,
): TProgressFunction<GProgressFunctionArgs, GValue> {
  return (progression: TProgression, ...args: GProgressFunctionArgs): GValue => {
    if (progression === 0) {
      return origin;
    } else if (progression === 1) {
      return target;
    } else {
      return transition(progression, ...args);
    }
  };
}

export function FastenTransitionForSameTargetAndOrigin<GProgressFunctionArgs extends any[], GValue>(
  origin: GValue,
  target: GValue,
  equalFunction: TEqualFunction<GValue>,
  generateTransition: TGenerateTransition<GProgressFunctionArgs, GValue>,
): TProgressFunction<GProgressFunctionArgs, GValue> {
  return equalFunction(origin, target)
    ? ((): GValue => target)
    : generateTransition(origin, target);
}
