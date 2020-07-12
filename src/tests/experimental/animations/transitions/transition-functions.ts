import { ICSSNumericValue, ICSSStyleValueStatic, ICSSUnitValueConstructor } from '../houdini';
import { TTimingFunction } from '../timing-functions/types';
import { IColor } from '../color/interfaces';
import { TTransitionFunction } from './types';
import { TProgression } from '../types';
import { Color } from '../color/implementation';

declare const CSSUnitValue: ICSSUnitValueConstructor;
declare const CSSNumericValue: ICSSStyleValueStatic;
declare const CSSStyleValue: ICSSStyleValueStatic;

/** CREATE **/

/**
 * Creates a transition from a CSSNumericValue to another
 */
export function CreateCSSNumericValueTransition(
  origin: ICSSNumericValue,
  target: ICSSNumericValue,
): TTransitionFunction<ICSSNumericValue> {
  return (progression: TProgression): ICSSNumericValue => {
    return target.sub(origin).mul(progression).add(origin);
  };
}

/**
 * Creates a transition from a color to another
 */
export function CreateColorTransition(
  origin: IColor,
  target: IColor,
): TTransitionFunction<IColor> {
  return (progression: TProgression): IColor => {
    return origin.mix(target, progression);
  };
}

/**
 * Creates a transition from a css property's value to another
 */
export function CreateCSSPropertyTransition(
  propertyName: string,
  origin: string,
  target: string,
): TTransitionFunction<string> {

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


/** APPLY TIMING FUNCTION **/



/** EXPERIMENTAL* */

// export function ResolveDynamicTransitionValue<T>(value: TDynamicTransitionValue<T>): T {
//   return (typeof value === 'function')
//     ? (value as (() => T))()
//     : value;
// }
//
//
// export function CreateDynamicTransition<TCreateTransition extends () => TTransitionFunction<any>>(
//   createTransition: TCreateTransition,
// ): TTransitionFunction<TInferTransitionFunctionType<ReturnType<TCreateTransition>>> {
//   type T = TInferTransitionFunctionType<ReturnType<TCreateTransition>>;
//   let transition: TTransitionFunction<T>;
//
//   return (progression: TProgression): T => {
//     if (progression === 0) {
//       transition = createTransition();
//     }
//     return transition(progression);
//   };
// }
//


