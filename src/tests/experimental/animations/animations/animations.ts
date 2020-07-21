import { TTransitionFunction } from '../transitions/types';
import { TAnimationProgression } from '../types';
import {
  TAnimationFunction, TAnimationFunctionRequiringFutureHTMLElements, TStylePropertyChangeMap, TStylePropertyName, TStylePropertyTuple,
  TStylePropertyValue, TStyleState, TStyleStateMap, TStyleStateTuples
} from './types';
import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { TTimingFunction, TTimingFunctionOrName } from '../timing-functions/types';
import {
  CreateReverseTimingFunction, TimingFunctionOrNameToTimingFunction
} from '../timing-functions/timing-functions';
import { IsAnimationProgression } from '../functions';
import { CreateCSSPropertyTransition } from '../transitions/css-property';


/** CREATE **/

/**
 * WARN: works only if the animation doesnt contain specific 'start' and 'end' progression events
 */
export function CreateReverseAnimation<TAnimation extends TAnimationFunction<any[]>>(
  animation: TAnimation
): TAnimation {
  return ApplyTimingFunctionToAnimation(CreateReverseTimingFunction(), animation);
}

/**
 * Creates an <animation> for a specific HTMLElement based on a 'property' and a <transition>
 */
export function CreateCSSPropertyAnimationForHTMLElement(
  element: HTMLElement,
  propertyName: string,
  transition: TTransitionFunction<string>,
): TAnimationFunction<[]> {
  return (progression: TAnimationProgression): void => {
    if (!IsAnimationProgression(progression)) {
      element.style.setProperty(propertyName, transition(progression));
    }
  };
}

/**
 * Creates an <animation> requiring a list of HTMLElements based on a 'property' and a <transition>
 */
export function CreateCSSPropertyAnimationWithTransitionRequiringFutureHTMLElements(
  propertyName: string,
  transition: TTransitionFunction<string>,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return (progression: TAnimationProgression, elements: ArrayLike<HTMLElement>): void => {
    if (!IsAnimationProgression(progression)) {
      const propertyValue: string = transition(progression);
      for (let i = 0, l = elements.length; i < l; i++) {
        elements[i].style.setProperty(propertyName, propertyValue);
      }
    }
  };
}

/**
 * Creates an <animation> requiring a list of HTMLElements, for a computed 'origin' to a computed 'target'
 * INFO: this function requires to call a 'start' and 'end' progression
 */
export function CreateCSSPropertyAnimationForComputedPropertyValueRequiringFutureHTMLElements(
  propertyName: string,
  origin: TStylePropertyValue,
  target: TStylePropertyValue,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  let animation: TAnimationFunction<[]>;
  return (progression: TAnimationProgression, elements: ArrayLike<HTMLElement>) => {
    if (progression === 'start') {
      const subAnimations: TAnimationFunction<[]>[] = Array.from(elements, (element: HTMLElement) => {
        const resolvedTarget: string = ResolveComputedStylePropertyValue(element, propertyName, target);
        const animation: TAnimationFunction<[]> = CreateCSSPropertyAnimationForHTMLElement(
          element,
          propertyName,
          CreateCSSPropertyTransition(
            propertyName,
            ResolveComputedStylePropertyValue(element, propertyName, origin),
            ResolveComputedStylePropertyValue(element, propertyName, target),
          ),
        );
        return (progression: TAnimationProgression) => {
          if (progression === 'end') {
            ApplyTargetComputedStylePropertyValue(element, propertyName, target, resolvedTarget);
          } else {
            return animation(progression);
          }
        };
      });
      animation = (progression: TAnimationProgression) => {
        for (let i = 0, l = subAnimations.length; i < l; i++) {
          subAnimations[i](progression);
        }
      };
    }
    return animation(progression);
  };
}

/**
 * Creates an <animation> requiring a list of HTMLElements, for a known 'origin' to a known 'target'
 * INFO: this function uses an optional call with an 'end' progression
 */
export function CreateCSSPropertyAnimationForNonComputedPropertyValueRequiringFutureHTMLElements(
  propertyName: string,
  origin: string,
  target: string,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  const animation: TAnimationFunctionRequiringFutureHTMLElements<[]> = CreateCSSPropertyAnimationWithTransitionRequiringFutureHTMLElements(
    propertyName,
    CreateCSSPropertyTransition(
      propertyName,
      origin,
      target,
    ),
  );
  return (progression: TAnimationProgression, elements: ArrayLike<HTMLElement>) => {
    if (progression === 'end') {
      for (let i = 0, l = elements.length; i < l; i++) {
        elements[i].style.setProperty(propertyName, target);
      }
    } else {
      animation(progression, elements);
    }
  };
}

/**
 * Creates an <animation> requiring a list of HTMLElements, for a potentially computed 'origin' to a potentially computed 'target'
 * INFO: this function requires to call a 'start' and 'end' progression
 */
export function CreateCSSPropertyAnimationRequiringFutureHTMLElements(
  propertyName: string,
  origin: TStylePropertyValue,
  target: TStylePropertyValue,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return (
    IsComputedStylePropertyValue(origin)
    || IsComputedStylePropertyValue(target)
  )
    ? CreateCSSPropertyAnimationForComputedPropertyValueRequiringFutureHTMLElements(propertyName, origin, target)
    : CreateCSSPropertyAnimationForNonComputedPropertyValueRequiringFutureHTMLElements(propertyName, origin as string, target as string);
}


/**
 * Creates an <animation> requiring a list of HTMLElements, from a style's state to another (represented as a Map)
 * INFO: this function requires to call a 'start' and 'end' progression
 */
export function CreateAnimationFromStylePropertyChangeMap(
  styleChangeMap: TStylePropertyChangeMap,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  const animations: TAnimationFunctionRequiringFutureHTMLElements<[]>[] = [];

  const iterator: Iterator<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]> = styleChangeMap.entries();
  let result: IteratorResult<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]>;
  while (!(result = iterator.next()).done) {
    const [propertyName, [origin, target]] = result.value;
    animations.push(CreateCSSPropertyAnimationRequiringFutureHTMLElements(propertyName, origin, target));
  }
  return (progression: TAnimationProgression, elements: ArrayLike<HTMLElement>): void => {
    for (let i = 0, l = animations.length; i < l; i++) {
      animations[i](progression, elements);
    }
  };
}


/**
 * Creates an <animation> requiring a list of HTMLElements, from a style's state to another, with a specific <timing function>
 * INFO: this function requires to call a 'start' and 'end' progression
 */
export function CreateCSSAnimation(
  origin: TStyleState,
  target: TStyleState,
  timingFunction: TTimingFunctionOrName = 'ease'
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return ApplyTimingFunctionToAnimation(
    TimingFunctionOrNameToTimingFunction(timingFunction),
    CreateAnimationFromStylePropertyChangeMap(NormalizeOriginAndTarget(origin, target)),
  );
}


/** FIX ARGUMENTS **/

export function SetElementsOfCSSPropertyAnimation(
  animation: TAnimationFunctionRequiringFutureHTMLElements<[]>,
  elements: ArrayLike<HTMLElement>,
): TAnimationFunction<[]> {
  return (progression: TAnimationProgression): void => {
    return animation(progression, elements);
  };
}

export function SetElementsOfCSSPropertyAnimationFromQuerySelector(
  animation: TAnimationFunctionRequiringFutureHTMLElements<[]>,
  selector: string,
  parentElement: ParentNode = document
): TAnimationFunction<[]> {
  let elements: ArrayLike<HTMLElement> = [];
  return (progression: TAnimationProgression): void => {
    if (progression === 'start') {
      elements = parentElement.querySelectorAll(selector);
    }
    return animation(progression, elements);
  };
}


/** HELPER FUNCTIONS **/

/**
 * Applies a <timing function> to an <animation>
 */
export function ApplyTimingFunctionToAnimation<TAnimation extends TAnimationFunction<any[]>>(
  timingFunction: TTimingFunction,
  animation: TAnimation,
): TAnimation {
  return ((progression: TAnimationProgression, ...args: any[]): any => {
    return animation(IsAnimationProgression(progression) ? progression : timingFunction(progression), ...args);
  }) as TAnimation;
}

/**
 * Converts a generic style state to a proper map
 */
export function NormalizeStyleState(style: TStyleState): TStyleStateMap {
  if (style instanceof Map) {
    return style;
  } else if (Symbol.iterator in style) {
    return new Map(style as TStyleStateTuples);
  } else if (IsObject(style)) {
    return new Map(Object.entries(style) as TStyleStateTuples);
  } else {
    throw new TypeError(`Invalid style's structure`);
  }
}

/**
 * Converts an 'origin' and 'target' (both style states), into a proper <style change map>
 */
export function NormalizeOriginAndTarget(
  origin: TStyleState,
  target: TStyleState,
): TStylePropertyChangeMap {
  const _origin: TStyleStateMap = NormalizeStyleState(origin);
  const _target: TStyleStateMap = NormalizeStyleState(target);

  const map: TStylePropertyChangeMap = new Map<TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]>();

  const originIterator: Iterator<TStylePropertyTuple> = _origin.entries();
  let originIteratorResult: IteratorResult<TStylePropertyTuple>;
  while (!(originIteratorResult = originIterator.next()).done) {
    const [key, value] = originIteratorResult.value;
    const target: TStylePropertyValue = _target.has(key) ? _target.get(key) as TStylePropertyValue : void 0;
    if (value !== target) {
      map.set(key, [value, target]);
    }
  }

  const targetIterator: Iterator<TStylePropertyTuple> = _target.entries();
  let targetIteratorResult: IteratorResult<TStylePropertyTuple>;
  while (!(targetIteratorResult = targetIterator.next()).done) {
    const [key, value] = targetIteratorResult.value;
    if ((value !== void 0) && !map.has(key)) {
      map.set(key, [void 0, value]);
    }
  }

  return map;
}

/**
 * Returns true if 'input' is a style property's value which requires to be computed
 */
export function IsComputedStylePropertyValue(input: TStylePropertyValue): boolean {
  return (input === void 0)
    || (input === null)
    || (input === 'auto');
}

/**
 * Returns true if 'styleChangeMap' doesn't contain any property requiring to be computed
 */
export function StylePropertyChangeMapContainsNoComputedProperty(styleChangeMap: TStylePropertyChangeMap): boolean {
  const iterator: Iterator<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]> = styleChangeMap.entries();
  let result: IteratorResult<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]>;
  while (!(result = iterator.next()).done) {
    if (
      IsComputedStylePropertyValue(result.value[1][0])
      || IsComputedStylePropertyValue(result.value[1][1])
    ) {
      return false;
    }
  }
  return true;
}


export function ResolveComputedStylePropertyValue(
  element: HTMLElement,
  propertyName: string,
  propertyValue: TStylePropertyValue,
): string {
  if (propertyValue === void 0) {
    return getComputedStyle(element).getPropertyValue(propertyName);
  } else if (propertyValue === null) {
    const currentPropertyValue = element.style.getPropertyValue(propertyName);
    element.style.removeProperty(propertyName);
    const inferredPropertyValue = getComputedStyle(element).getPropertyValue(propertyName);
    element.style.setProperty(propertyName, currentPropertyValue);
    return inferredPropertyValue;
  } else if (propertyValue === 'auto') {
    const currentPropertyValue = element.style.getPropertyValue(propertyName);
    element.style.setProperty(propertyName, 'auto');
    const inferredPropertyValue = getComputedStyle(element).getPropertyValue(propertyName);
    element.style.setProperty(propertyName, currentPropertyValue);
    return inferredPropertyValue;
  } else {
    return propertyValue;
  }
}


export function ApplyTargetComputedStylePropertyValue(
  element: HTMLElement,
  propertyName: string,
  propertyValue: TStylePropertyValue,
  resolvedPropertyValue: string,
): void {
  if (propertyValue === null) {
    element.style.removeProperty(propertyName);
  } else if (propertyValue === 'auto') {
    element.style.setProperty(propertyName, 'auto');
  } else {
    element.style.setProperty(propertyName, resolvedPropertyValue);
  }
}

