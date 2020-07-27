import { TProgressFunction, TProgression } from '../types';
import { CreateTransformMatrixTransition, TTransformMatrixTransitionFunction } from './transform-matrix';
import { DOMMatrixEquals } from '../../../../misc/helpers/dom-matrix';

export type TDOMMatrixTransitionFunction = TProgressFunction<[], DOMMatrix>;

/**
 * Creates a transition from a DOMMatrix to another
 */
export function CreateDOMMatrixTransitionNotOptimized(
  origin: DOMMatrix,
  target: DOMMatrix,
): TDOMMatrixTransitionFunction {
  const transition: TTransformMatrixTransitionFunction = CreateTransformMatrixTransition(
    origin.toFloat32Array(),
    target.toFloat32Array(),
  );
  return (progression: TProgression): DOMMatrix => {
    return DOMMatrix.fromFloat32Array(transition(progression) as Float32Array);
  };
}

export function CreateDOMMatrixTransition(
  origin: DOMMatrix,
  target: DOMMatrix,
): TDOMMatrixTransitionFunction {
  return DOMMatrixEquals(origin, target)
    ? (() => target)
    : CreateDOMMatrixTransitionNotOptimized(origin, target);
}


