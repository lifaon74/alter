import {
  TProgressFunction, TProgressFunctionWithSpecialState, TProgressionSpecialState, TProgressionWithSpecialState
} from '../types';
import { ProgressionWithSpecialStateToProgression } from '../functions';
import { CreateNumericValueTransition } from './numeric-value';


export type TScrollDirectionToHTMLElementPropertyMap = {
  vertical: 'scrollTop',
  horizontal: 'scrollLeft',
};
export type TScrollDirection = keyof TScrollDirectionToHTMLElementPropertyMap;
export type TScrollHTMLElementProperty = TScrollDirectionToHTMLElementPropertyMap[TScrollDirection];

export type TScrollValue = number;
export type TScrollOptionalValue = TScrollValue | undefined;


export type TAnimatableScrollValueTransition = TProgressFunction<[], TScrollValue>;
export type TComputedScrollValueTransition = TProgressFunctionWithSpecialState<[HTMLElement], TScrollValue>;

export interface TAnimatableScrollValueTransitionObject {
  transition: TAnimatableScrollValueTransition;
  isComputed: false;
}

export interface TComputedScrollValueTransitionObject {
  transition: TComputedScrollValueTransition;
  isComputed: true;
}

export type TScrollValueTransition =
  TAnimatableScrollValueTransitionObject
  | TComputedScrollValueTransitionObject;

/*--*/


export function ScrollDirectionToHTMLElementProperty<GDirection extends TScrollDirection>(
  direction: GDirection,
): TScrollDirectionToHTMLElementPropertyMap[GDirection] {
  switch (direction) {
    case 'horizontal':
      return 'scrollLeft' as any;
    case 'vertical':
      return 'scrollTop' as any;
    default:
      throw new TypeError(`Invalid value for direction`);
  }
}

export function IsAnimatableScrollValue(value: any): value is TScrollValue {
  return (typeof value === 'number');
}

/**
 * Resolves 'computedValue'
 */
export function GetComputedScrollValue(
  element: HTMLElement,
  direction: TScrollDirection,
  computedValue: TScrollOptionalValue,
): number {
  return (computedValue === void 0)
    ? element[ScrollDirectionToHTMLElementProperty(direction)]
    : computedValue;
}

/**
 * Creates a transition from two scroll values. This transition may require a HTMLElement
 */
export function CreateScrollValueTransitionNotOptimized(
  direction: TScrollDirection,
  origin: TScrollOptionalValue,
  target: TScrollOptionalValue,
): TScrollValueTransition {
  if (IsAnimatableScrollValue(origin)) {
    if (IsAnimatableScrollValue(target)) {
      return {
        transition: CreateNumericValueTransition(origin, target),
        isComputed: false,
      };
    } else {
      let transition: TAnimatableScrollValueTransition;
      return {
        transition: (progression: TProgressionWithSpecialState, element: HTMLElement) => {
          if (progression === TProgressionSpecialState.START) {
            transition = CreateNumericValueTransition(
              origin,
              GetComputedScrollValue(element, direction, target),
            );
          }
          return transition(ProgressionWithSpecialStateToProgression(progression));
        },
        isComputed: true,
      };
    }
  } else {
    if (IsAnimatableScrollValue(target)) {
      let transition: TAnimatableScrollValueTransition;
      return {
        transition: (progression: TProgressionWithSpecialState, element: HTMLElement) => {
          if (progression === TProgressionSpecialState.START) {
            transition = CreateNumericValueTransition(
              GetComputedScrollValue(element, direction, origin),
              target,
            );
          }
          return transition(ProgressionWithSpecialStateToProgression(progression));
        },
        isComputed: true,
      };
    } else {
      let transition: TAnimatableScrollValueTransition;
      return {
        transition: (progression: TProgressionWithSpecialState, element: HTMLElement) => {
          if (progression === TProgressionSpecialState.START) {
            transition = CreateNumericValueTransition(
              GetComputedScrollValue(element, direction, origin),
              GetComputedScrollValue(element, direction, target),
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
  //   return CreateStaticScrollValueTransition(origin as IScrollValue, target as IScrollValue);
  // } else {
  //   let transition: TAnimatableScrollValueTransition;
  //   return (progression: TProgressionWithSpecialState, element: HTMLElement) => {
  //     if (progression === TProgressionSpecialState.START) {
  //       const _origin: IScrollValue = originIsAnimatable
  //         ? origin as IScrollValue
  //         : GetComputedScrollValue(element, propertyName, origin);
  //       const _target: IScrollValue = originIsAnimatable
  //         ? target as IScrollValue
  //         : GetComputedScrollValue(element, propertyName, target);
  //       transition = CreateStaticScrollValueTransition(_origin, _target);
  //     }
  //     return transition(ProgressionWithSpecialStateToProgression(progression));
  //   };
  // }
}


/**
 * Creates a transition from a scroll value to another
 */
export function CreateScrollValueTransition(
  direction: TScrollDirection,
  origin: TScrollOptionalValue,
  target: TScrollOptionalValue,
): TScrollValueTransition {
  if ((origin === target) && (origin !== void 0) && (target !== void 0)) {
    return {
      transition: () => target,
      isComputed: false
    };
  } else {
    return CreateScrollValueTransitionNotOptimized(
      direction,
      origin,
      target,
    );
  }
}
