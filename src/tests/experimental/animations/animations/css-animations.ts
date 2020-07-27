import { HTMLElementArray, TProgressionWithSpecialState } from '../types';
import { TAnimationFunctionRequiringFutureHTMLElements } from './types';
import { TTimingFunctionOrName } from '../timing-functions/types';
import { ApplyTimingFunction, TimingFunctionOrNameToTimingFunction } from '../timing-functions/timing-functions';
import {
  CreateCSSPropertyTransition, SetCSSStyleProperty, TAnimatableCSSPropertyTransition, TComputedCSSPropertyTransition,
  TCSSPropertyTransition
} from '../transitions/css-property';
import { TStylePropertyChangeMap, TStylePropertyName, TStylePropertyValue, TStyleState } from '../style-state/types';
import { OriginAndTargetStyleStatesToChangeMap } from '../style-state/style-state';
import { IsProgressionSpecialState } from '../functions';
import {
  CreateScrollValueTransition, ScrollDirectionToHTMLElementProperty, TAnimatableScrollValueTransition,
  TComputedScrollValueTransition, TScrollDirection, TScrollHTMLElementProperty,
  TScrollOptionalValue,
  TScrollValueTransition
} from '../transitions/scroll';


/** CREATE **/

/**
 * Creates an <elements animation> from an <animatable css property transition>
 */
export function CreateCSSPropertyAnimationFromAnimatableCSSPropertyTransitionRequiringFutureHTMLElements(
  propertyName: string,
  transition: TAnimatableCSSPropertyTransition,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return (progression: TProgressionWithSpecialState, elements: HTMLElementArray): void => {
    if (!IsProgressionSpecialState(progression)) {
      const value: string = transition(progression);
      for (let i = 0, l = elements.length; i < l; i++) {
        elements[i].style.setProperty(propertyName, value);
      }
    }
  };
}

/**
 * Creates an <elements animation> from a <computed css property transition>
 */
export function CreateCSSPropertyAnimationFromComputedCSSPropertyTransitionRequiringFutureHTMLElements(
  propertyName: string,
  transition: TComputedCSSPropertyTransition,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return (progression: TProgressionWithSpecialState, elements: HTMLElementArray): void => {
    if (IsProgressionSpecialState(progression)) {
      for (let i = 0, l = elements.length; i < l; i++) {
        transition(progression, elements[i]);
      }
    } else {
      for (let i = 0, l = elements.length; i < l; i++) {
        const element: HTMLElement = elements[i];
        element.style.setProperty(propertyName, transition(progression, element));
      }
    }
  };
}

/**
 * Creates an <elements animation> from a <css property transition>
 */
export function CreateCSSPropertyAnimationFromCSSPropertyTransitionRequiringFutureHTMLElements(
  propertyName: string,
  transition: TCSSPropertyTransition,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return transition.isComputed
    ? CreateCSSPropertyAnimationFromComputedCSSPropertyTransitionRequiringFutureHTMLElements(propertyName, transition.transition)
    : CreateCSSPropertyAnimationFromAnimatableCSSPropertyTransitionRequiringFutureHTMLElements(propertyName, transition.transition);
}


/**
 * Applies 'origin' and 'target' styles when progression is 0 or 1, else calls normal animation
 */
export function WrapCSSPropertyAnimationForStylePropertyValueRequiringFutureHTMLElementsWithEdgeProgression<GArgs extends any[]>(
  propertyName: string,
  origin: TStylePropertyValue,
  target: TStylePropertyValue,
  animation: TAnimationFunctionRequiringFutureHTMLElements<GArgs>,
): TAnimationFunctionRequiringFutureHTMLElements<GArgs> {
  return (progression: TProgressionWithSpecialState, elements: HTMLElementArray, ...args: GArgs): void => {
    if (progression === 0) {
      for (let i = 0, l = elements.length; i < l; i++) {
        SetCSSStyleProperty(elements[i], propertyName, origin);
      }
    } else if (progression === 1) {
      for (let i = 0, l = elements.length; i < l; i++) {
        SetCSSStyleProperty(elements[i], propertyName, target);
      }
    } else {
      animation(progression, elements, ...args);
    }
  };
}


/**
 * Creates an <elements animation> from a css property to another
 */
export function CreateCSSPropertyAnimationForStylePropertyValueRequiringFutureHTMLElements(
  propertyName: string,
  origin: TStylePropertyValue,
  target: TStylePropertyValue,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  const transition: TCSSPropertyTransition = CreateCSSPropertyTransition(
    propertyName,
    origin,
    target,
  );
  return WrapCSSPropertyAnimationForStylePropertyValueRequiringFutureHTMLElementsWithEdgeProgression<[]>(
    propertyName,
    origin,
    target,
    CreateCSSPropertyAnimationFromCSSPropertyTransitionRequiringFutureHTMLElements(propertyName, transition)
  );
}


/**
 * Creates an <elements animation> from a style's state to another (represented as a Map)
 */
export function CreateAnimationFromStylePropertyChangeMap(
  styleChangeMap: TStylePropertyChangeMap,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  const animations: TAnimationFunctionRequiringFutureHTMLElements<[]>[] = [];

  const iterator: Iterator<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]> = styleChangeMap.entries();
  let result: IteratorResult<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]>;
  while (!(result = iterator.next()).done) {
    const [propertyName, [origin, target]] = result.value;
    animations.push(CreateCSSPropertyAnimationForStylePropertyValueRequiringFutureHTMLElements(propertyName, origin, target));
  }
  return (progression: TProgressionWithSpecialState, elements: HTMLElementArray): void => {
    for (let i = 0, l = animations.length; i < l; i++) {
      animations[i](progression, elements);
    }
  };
}


/**
 * Creates an <elements animation> from a style's state to another, with a specific <timing function>
 */
export function CreateCSSAnimation(
  origin: TStyleState,
  target: TStyleState,
  timingFunction: TTimingFunctionOrName = 'ease'
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return ApplyTimingFunction(
    TimingFunctionOrNameToTimingFunction(timingFunction),
    CreateAnimationFromStylePropertyChangeMap(OriginAndTargetStyleStatesToChangeMap(origin, target)),
  );
}

