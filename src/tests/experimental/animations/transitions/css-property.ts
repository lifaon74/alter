import {
  ICSSNumericValue, ICSSStyleValue, ICSSStyleValueStatic, ICSSTransformValue, ICSSTransformValueConstructor
} from '../houdini';
import {
  TProgressFunction, TProgressFunctionWithSpecialState, TProgression, TProgressionSpecialState,
  TProgressionWithSpecialState
} from '../types';
import { Color } from '../../../../misc/color/implementation';
import { IColor } from '../../../../misc/color/interfaces';
import { CreateColorTransition } from './color';
import { CreateCSSNumericValueTransition } from './css-numeric-value';
import { CreateCSSTransformValueTransition } from './css-transform-value';
import { ProgressionWithSpecialStateToProgression } from '../functions';
import { IsNull } from '../../../../misc/helpers/is/IsNull';

declare const CSSStyleValue: ICSSStyleValueStatic;
declare const CSSNumericValue: ICSSStyleValueStatic;
declare const CSSTransformValue: ICSSTransformValueConstructor;

/*---*/

export type TCSSStyleValue = IColor | ICSSStyleValue;
export type TCSSOptionalValue<G> = G | null | undefined; // if null => CSSStyleValue must be removed, if undefined => take current value

/*--*/

export type TAnimatableCSSStyleValueTransition = TProgressFunction<[], TCSSStyleValue>;
export type TComputedCSSStyleValueTransition = TProgressFunctionWithSpecialState<[HTMLElement], TCSSStyleValue>;

export interface TAnimatableCSSStyleValueTransitionObject {
  transition: TAnimatableCSSStyleValueTransition;
  isComputed: false;
}

export interface TComputedCSSStyleValueTransitionObject {
  transition: TComputedCSSStyleValueTransition;
  isComputed: true;
}

export type TCSSStyleValueTransition =
  TAnimatableCSSStyleValueTransitionObject
  | TComputedCSSStyleValueTransitionObject;


/*--*/

export type TAnimatableCSSPropertyTransition = TProgressFunction<[], string>;
export type TComputedCSSPropertyTransition = TProgressFunctionWithSpecialState<[HTMLElement], string>;

export interface TAnimatableCSSPropertyTransitionObject {
  transition: TAnimatableCSSPropertyTransition;
  isComputed: false;
}

export interface TComputedCSSPropertyTransitionObject {
  transition: TComputedCSSPropertyTransition;
  isComputed: true;
}

export type TCSSPropertyTransition =
  TAnimatableCSSPropertyTransitionObject
  | TComputedCSSPropertyTransitionObject;

/*--*/

export function IsCSSStyleValue(value: any): value is ICSSStyleValue {
  return (value instanceof (CSSStyleValue as any)); // TODO update when def
}

export function IsCSSNumericValue(value: any): value is ICSSNumericValue {
  return (value instanceof (CSSNumericValue as any)); // TODO update when def
}

export function IsCSSTransformValue(value: any): value is ICSSTransformValue {
  return (value instanceof (CSSTransformValue as any)); // TODO update when def
}

export function IsCSSColorValue(value: any): value is IColor {
  return (value instanceof Color);
}

export function IsAnimatableCSSValue(value: any): value is ICSSStyleValue {
  return IsCSSNumericValue(value)
    || IsCSSTransformValue(value)
    || IsCSSColorValue(value);
}


/**
 * Creates a static transition from two css values
 */
export function CreateStaticCSSStyleValueTransition(
  origin: TCSSStyleValue,
  target: TCSSStyleValue,
): TAnimatableCSSStyleValueTransition {
  if (IsCSSNumericValue(origin)) {
    if (IsCSSNumericValue(target)) {
      return CreateCSSNumericValueTransition(origin, target);
    } else {
      throw new Error(`Cannot mix '${ origin }' with '${ target }'`);
    }
  }

  if (IsCSSTransformValue(origin)) {
    if (IsCSSTransformValue(target)) {
      return CreateCSSTransformValueTransition(origin, target);
    } else {
      throw new Error(`Cannot mix '${ origin }' with '${ target }'`);
    }
  }

  if (IsCSSColorValue(origin)) {
    if (IsCSSColorValue(target)) {
      return CreateColorTransition(origin, target);
    } else {
      throw new Error(`Cannot mix '${ origin }' with '${ target }'`);
    }
  }

  throw new Error(`origin, target or both are not not animatable values`);
}

/**
 * Stores the css property's state of 'element', calls 'callback', and then restores this state
 */
export function SaveRestoreCSSProperty<GReturn>(
  element: HTMLElement,
  propertyName: string,
  callback: () => GReturn,
): GReturn {
  const _propertyValue: string = element.style.getPropertyValue(propertyName);
  const _propertyPriority: string = element.style.getPropertyPriority(propertyName);
  const result: GReturn = callback();
  if (_propertyValue === '') {
    element.style.removeProperty(propertyName);
  } else {
    element.style.setProperty(propertyName, _propertyValue, _propertyPriority);
  }
  return result;
}


export function SetCSSStyleProperty(
  element: HTMLElement,
  propertyName: string,
  propertyValue: TCSSOptionalValue<string>,
  propertyPriority?: string,
): void {
  if (propertyValue === null) {
    element.style.removeProperty(propertyName);
  } else if (propertyValue !== void 0) {
    element.style.setProperty(propertyName, propertyValue, propertyPriority);
  }
}

/**
 * Resolves 'computedValue'
 */
export function GetComputedCSSStyleValue(
  element: HTMLElement,
  propertyName: string,
  computedValue: TCSSOptionalValue<string>,
): ICSSStyleValue {
  return SaveRestoreCSSProperty<ICSSStyleValue>(element, propertyName, () => {
    SetCSSStyleProperty(element, propertyName, computedValue);
    return CSSStyleValue.parse(propertyName, getComputedStyle(element).getPropertyValue(propertyName));
  });
}


/**
 * Creates a transition from two css values. This transition may require a HTMLElement
 */
export function CreateCSSStyleValueTransition(
  propertyName: string,
  origin: TCSSOptionalValue<TCSSStyleValue>,
  target: TCSSOptionalValue<TCSSStyleValue>,
): TCSSStyleValueTransition {
  if (IsAnimatableCSSValue(origin)) {
    if (IsAnimatableCSSValue(target)) {
      return {
        transition: CreateStaticCSSStyleValueTransition(origin as ICSSStyleValue, target as ICSSStyleValue),
        isComputed: false,
      };
    } else {
      let transition: TAnimatableCSSStyleValueTransition;
      return {
        transition: (progression: TProgressionWithSpecialState, element: HTMLElement) => {
          if (progression === TProgressionSpecialState.START) {
            // if (IsProgressionSpecialState(progression)) {
            transition = CreateStaticCSSStyleValueTransition(
              origin,
              GetComputedCSSStyleValue(element, propertyName, target),
            );
          }
          return transition(ProgressionWithSpecialStateToProgression(progression));
        },
        isComputed: true,
      };
    }
  } else {
    if (IsAnimatableCSSValue(target)) {
      let transition: TAnimatableCSSStyleValueTransition;
      return {
        transition: (progression: TProgressionWithSpecialState, element: HTMLElement) => {
          if (progression === TProgressionSpecialState.START) {
            // if (IsProgressionSpecialState(progression)) {
            transition = CreateStaticCSSStyleValueTransition(
              GetComputedCSSStyleValue(element, propertyName, origin),
              target,
            );
          }
          return transition(ProgressionWithSpecialStateToProgression(progression));
        },
        isComputed: true,
      };
    } else {
      let transition: TAnimatableCSSStyleValueTransition;
      return {
        transition: (progression: TProgressionWithSpecialState, element: HTMLElement) => {
          if (progression === TProgressionSpecialState.START) {
            // if (IsProgressionSpecialState(progression)) {
            transition = CreateStaticCSSStyleValueTransition(
              GetComputedCSSStyleValue(element, propertyName, origin),
              GetComputedCSSStyleValue(element, propertyName, target),
            );
          }
          return transition(ProgressionWithSpecialStateToProgression(progression));
        },
        isComputed: true,
      };
    }
  }

  // const originIsAnimatable: boolean = IsAnimatableCSSValue(origin);
  // const targetIsAnimatable: boolean = IsAnimatableCSSValue(origin);
  //
  // if (originIsAnimatable && targetIsAnimatable) {
  //   return CreateStaticCSSStyleValueTransition(origin as ICSSStyleValue, target as ICSSStyleValue);
  // } else {
  //   let transition: TAnimatableCSSStyleValueTransition;
  //   return (progression: TProgressionWithSpecialState, element: HTMLElement) => {
  //     if (progression === TProgressionSpecialState.START) {
  //       const _origin: ICSSStyleValue = originIsAnimatable
  //         ? origin as ICSSStyleValue
  //         : GetComputedCSSStyleValue(element, propertyName, origin);
  //       const _target: ICSSStyleValue = originIsAnimatable
  //         ? target as ICSSStyleValue
  //         : GetComputedCSSStyleValue(element, propertyName, target);
  //       transition = CreateStaticCSSStyleValueTransition(_origin, _target);
  //     }
  //     return transition(ProgressionWithSpecialStateToProgression(progression));
  //   };
  // }
}


/**
 * Converts a css property's value (string) to a css value (object)
 */
export function ConvertCSSPropertyToCSSStyleValue(
  propertyName: string,
  value: TCSSOptionalValue<string>,
): TCSSOptionalValue<TCSSStyleValue> {
  if ((value === null) || (value === void 0)) {
    return value;
  } else {
    const color: IColor | null = Color.parse(value);
    return (color == null)
      ? CSSStyleValue.parse(propertyName, value)
      : color;
  }
}


/**
 * Creates a transition from two css property values (string). This transition may require a HTMLElement
 */
export function CreateCSSPropertyTransitionNotOptimized(
  propertyName: string,
  origin: TCSSOptionalValue<string>,
  target: TCSSOptionalValue<string>,
): TCSSPropertyTransition {

  const { transition, isComputed } = CreateCSSStyleValueTransition(
    propertyName,
    ConvertCSSPropertyToCSSStyleValue(propertyName, origin),
    ConvertCSSPropertyToCSSStyleValue(propertyName, target)
  );

  return isComputed
    ?
    {
      transition: (progression: TProgressionWithSpecialState, element: HTMLElement): string => {
        return (transition as TComputedCSSStyleValueTransition)(progression, element).toString();
      },
      isComputed: true
    }
    :
    {
      transition: (progression: TProgression): string => {
        return (transition as TAnimatableCSSPropertyTransition)(progression).toString();
      },
      isComputed: false
    };
}


/**
 * Creates a transition from a css property's value to another
 */
export function CreateCSSPropertyTransition(
  propertyName: string,
  origin: TCSSOptionalValue<string>,
  target: TCSSOptionalValue<string>,
): TCSSPropertyTransition {
  if ((origin === target) && !IsNull(origin) && !IsNull(target)) {
    return {
      transition: () => target,
      isComputed: false
    };
  } else {
    return CreateCSSPropertyTransitionNotOptimized(
      propertyName,
      origin,
      target,
    );
  }
}

export function CreateUniversalCSSPropertyTransition(
  propertyName: string,
  origin: TCSSOptionalValue<string>,
  target: TCSSOptionalValue<string>,
): TComputedCSSPropertyTransition {
  const transition: TCSSPropertyTransition = CreateCSSPropertyTransition(propertyName, origin, target);
  return transition.transition as TComputedCSSPropertyTransition;
}
