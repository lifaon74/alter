import { ICSSMatrixComponentConstructor, ICSSTransformValue, ICSSTransformValueConstructor } from '../houdini';
import { TTransitionFunction } from './types';
import { TProgression } from '../types';
import { CreateDOMMatrixTransition, DOMMatrixEquals } from './dom-matrix';

declare const CSSTransformValue: ICSSTransformValueConstructor;
declare const CSSMatrixComponent: ICSSMatrixComponentConstructor;

/**
 * Creates a transition from a CSSTransformValue to another
 */
export function CreateCSSTransformValueTransition(
  origin: ICSSTransformValue,
  target: ICSSTransformValue,
): TTransitionFunction<ICSSTransformValue> {
  const originMatrix: DOMMatrix = origin.toMatrix();
  const targetMatrix: DOMMatrix = target.toMatrix();
  if (DOMMatrixEquals(originMatrix, targetMatrix)) {
    return () => target;
  } else {
    const transition: TTransitionFunction<DOMMatrix> = CreateDOMMatrixTransition(
      originMatrix,
      targetMatrix,
    );
    return (progression: TProgression): ICSSTransformValue => {
      return new CSSTransformValue([new CSSMatrixComponent(transition(progression))]);
    };
  }
}

export function CSSTransformValueEquals(a: ICSSTransformValue, b: ICSSTransformValue): boolean {
  return DOMMatrixEquals(a.toMatrix(), b.toMatrix());
}
