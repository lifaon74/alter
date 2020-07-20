import { TTransitionFunction } from './types';
import { ICSSNumericValue, ICSSStyleValueStatic, ICSSTransformValue, ICSSTransformValueConstructor } from '../houdini';
import { TProgression } from '../types';
import { Color } from '../../../../misc/color/implementation';
import { IColor } from '../../../../misc/color/interfaces';
import { CreateColorTransition } from './color';
import { CreateCSSNumericValueTransition } from './css-numeric-value';
import { CreateCSSTransformValueTransition } from './css-transform-value';

declare const CSSStyleValue: ICSSStyleValueStatic;
declare const CSSNumericValue: ICSSStyleValueStatic;
declare const CSSTransformValue: ICSSTransformValueConstructor;


/**
 * Creates a transition from a css property's value to another
 */
export function CreateCSSPropertyTransition(
  propertyName: string,
  origin: string,
  target: string,
): TTransitionFunction<string> {
  if (origin === target) {
    return () => target;
  } else {
    const originAsCSSStyleValue = CSSStyleValue.parse(propertyName, origin);
    const targetAsCSSStyleValue = CSSStyleValue.parse(propertyName, target);

    if (originAsCSSStyleValue instanceof (CSSNumericValue as any)) { // TODO update when def
      if (targetAsCSSStyleValue instanceof (CSSNumericValue as any)) { // TODO update when def
        const transition: TTransitionFunction<ICSSNumericValue> = CreateCSSNumericValueTransition(originAsCSSStyleValue as ICSSNumericValue, targetAsCSSStyleValue as ICSSNumericValue);
        return (progression: TProgression): string => {
          return transition(progression).toString();
        };
      } else {
        throw new Error(`Cannot mix '${ origin }' with '${ target }'`);
      }
    }

    if (originAsCSSStyleValue instanceof (CSSTransformValue as any)) { // TODO update when def
      if (targetAsCSSStyleValue instanceof (CSSTransformValue as any)) { // TODO update when def
        const transition: TTransitionFunction<ICSSTransformValue> = CreateCSSTransformValueTransition(originAsCSSStyleValue as ICSSTransformValue, targetAsCSSStyleValue as ICSSTransformValue);
        return (progression: TProgression): string => {
          return transition(progression).toString();
        };
      } else {
        throw new Error(`Cannot mix '${ origin }' with '${ target }'`);
      }
    }

    const originAsColor = Color.parse(origin);
    const targetAsColor = Color.parse(target);

    if (originAsColor !== null) {
      if (targetAsColor !== null) {
        const transition: TTransitionFunction<IColor> = CreateColorTransition(originAsColor, targetAsColor);
        return (progression: TProgression): string => {
          return transition(progression).toString();
        };
      } else {
        throw new Error(`Cannot mix '${ origin }' with '${ target }'`);
      }
    }

    throw new Error(`Cannot apply a transition on '${ origin }' and '${ target }'`);
  }
}

