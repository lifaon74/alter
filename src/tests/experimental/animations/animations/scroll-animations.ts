import {
  CreateScrollValueTransition,
  ScrollDirectionToHTMLElementProperty, TAnimatableScrollValueTransition, TComputedScrollValueTransition,
  TScrollDirection, TScrollHTMLElementProperty, TScrollOptionalValue, TScrollValueTransition
} from '../transitions/scroll';
import { TAnimationFunctionRequiringFutureHTMLElements } from './types';
import { HTMLElementArray, TProgressionWithSpecialState } from '../types';
import { TTimingFunctionOrName } from '../timing-functions/types';
import { ApplyTimingFunction, TimingFunctionOrNameToTimingFunction } from '../timing-functions/timing-functions';
import { IsProgressionSpecialState } from '../functions';


/**
 * Creates an <elements animation> from an <animatable scroll transition>
 */
export function CreateScrollAnimationFromAnimatableScrollValueTransitionRequiringFutureHTMLElements(
  direction: TScrollDirection,
  transition: TAnimatableScrollValueTransition,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  const propertyName: TScrollHTMLElementProperty = ScrollDirectionToHTMLElementProperty(direction);
  return (progression: TProgressionWithSpecialState, elements: HTMLElementArray): void => {
    if (!IsProgressionSpecialState(progression)) {
      const value: number = transition(progression);
      for (let i = 0, l = elements.length; i < l; i++) {
        elements[i][propertyName] = value;
      }
    }
  };
}

/**
 * Creates an <elements animation> from a <computed scroll transition>
 */
export function CreateScrollAnimationFromComputedScrollValueTransitionRequiringFutureHTMLElements(
  direction: TScrollDirection,
  transition: TComputedScrollValueTransition,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  const propertyName: TScrollHTMLElementProperty = ScrollDirectionToHTMLElementProperty(direction);
  return (progression: TProgressionWithSpecialState, elements: HTMLElementArray): void => {
    if (IsProgressionSpecialState(progression)) {
      for (let i = 0, l = elements.length; i < l; i++) {
        transition(progression, elements[i]);
      }
    } else {
      for (let i = 0, l = elements.length; i < l; i++) {
        const element: HTMLElement = elements[i];
        elements[i][propertyName] = transition(progression, element);
      }
    }
  };
}

/**
 * Creates an <elements animation> from a <scroll transition>
 */
export function CreateScrollAnimationFromScrollValueTransitionRequiringFutureHTMLElements(
  direction: TScrollDirection,
  transition: TScrollValueTransition,
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return transition.isComputed
    ? CreateScrollAnimationFromComputedScrollValueTransitionRequiringFutureHTMLElements(direction, transition.transition)
    : CreateScrollAnimationFromAnimatableScrollValueTransitionRequiringFutureHTMLElements(direction, transition.transition);
}


/**
 * Creates an <elements animation> from a scroll position to another, with a specific <timing function>
 */
export function CreateScrollAnimation(
  direction: TScrollDirection,
  origin: TScrollOptionalValue,
  target: TScrollOptionalValue,
  timingFunction: TTimingFunctionOrName = 'ease'
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return ApplyTimingFunction(
    TimingFunctionOrNameToTimingFunction(timingFunction),
    CreateScrollAnimationFromScrollValueTransitionRequiringFutureHTMLElements(
      direction,
      CreateScrollValueTransition(direction, origin, target),
    ),
  );
}


