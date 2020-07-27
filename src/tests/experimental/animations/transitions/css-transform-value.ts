import { ICSSMatrixComponentConstructor, ICSSTransformValue, ICSSTransformValueConstructor } from '../houdini';
import { TProgressFunction, TProgression } from '../types';
import { CreateDOMMatrixTransition, TDOMMatrixTransitionFunction } from './dom-matrix';
import { DOMMatrixEquals } from '../../../../misc/helpers/dom-matrix';

declare const CSSTransformValue: ICSSTransformValueConstructor;
declare const CSSMatrixComponent: ICSSMatrixComponentConstructor;

export type TCSSTransformValueTransitionFunction = TProgressFunction<[], ICSSTransformValue>;

/**
 * Creates a transition from a CSSTransformValue to another
 */
export function CreateCSSTransformValueTransitionNotOptimized(
  origin: ICSSTransformValue,
  target: ICSSTransformValue,
): TCSSTransformValueTransitionFunction {
  const transition: TDOMMatrixTransitionFunction = CreateDOMMatrixTransition(
    origin.toMatrix(),
    target.toMatrix(),
  );
  return (progression: TProgression): ICSSTransformValue => {
    return new CSSTransformValue([new CSSMatrixComponent(transition(progression))]);
  };
}

export function CreateCSSTransformValueTransition(
  origin: ICSSTransformValue,
  target: ICSSTransformValue,
): TCSSTransformValueTransitionFunction {
  const originMatrix: DOMMatrix = origin.toMatrix();
  const targetMatrix: DOMMatrix = target.toMatrix();
  if (DOMMatrixEquals(originMatrix, targetMatrix)) {
    return () => target;
  } else {
    const transition: TDOMMatrixTransitionFunction = CreateDOMMatrixTransition(
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
