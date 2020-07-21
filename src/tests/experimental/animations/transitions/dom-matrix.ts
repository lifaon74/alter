import { TTransitionFunction } from './types';
import { mat4 } from 'gl-matrix';
import { TProgression } from '../types';
import { CreateTransformMatrixTransition } from './transform-matrix';

/**
 * Creates a transition from a DOMMatrix to another
 */
export function CreateDOMMatrixTransitionUnoptimized(
  origin: DOMMatrix,
  target: DOMMatrix,
): TTransitionFunction<DOMMatrix> {
  const transition: TTransitionFunction<mat4> = CreateTransformMatrixTransition(
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
): TTransitionFunction<DOMMatrix> {
  return DOMMatrixEquals(origin, target)
    ? (() => target)
    : CreateDOMMatrixTransitionUnoptimized(origin, target);
}

export function DOMMatrixEquals(a: DOMMatrix, b: DOMMatrix): boolean {
  return (a.m11 === b.m11)
    && (a.m12 === b.m12)
    && (a.m13 === b.m13)
    && (a.m14 === b.m14)

    && (a.m21 === b.m21)
    && (a.m22 === b.m22)
    && (a.m23 === b.m23)
    && (a.m24 === b.m24)

    && (a.m31 === b.m31)
    && (a.m32 === b.m32)
    && (a.m33 === b.m33)
    && (a.m34 === b.m34)

    && (a.m41 === b.m41)
    && (a.m42 === b.m42)
    && (a.m43 === b.m43)
    && (a.m44 === b.m44);
}