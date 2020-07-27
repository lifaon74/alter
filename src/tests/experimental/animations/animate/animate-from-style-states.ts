import { TStyleState } from '../style-state/types';
import {
  IReduceAnimateFunctionOptions, TAnimateFunctionRequiringFutureDurationAndHTMLElements,
  TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult
} from './types';
import { HTMLElementArray } from '../types';
import {
  CreateAnimateFunctionFromAnimationRequiringFutureDuration,
  CreateSequentialWeightedAnimateFunctionWithFutureDuration, ReduceAnimateFunctionRequiringFutureDurationAndHTMLElements
} from './animate';
import { CreateCSSAnimation } from '../animations/css-animations';
import { ArrayFrom } from '../../../../misc/helpers/array-helpers';
import { TTimingFunctionOrName } from '../timing-functions/types';
import { IsObject } from '../../../../misc/helpers/is/IsObject';


export interface TStyleStateWithDuration {
  state: TStyleState;
  duration: number;
  timingFunction?: TTimingFunctionOrName;
}

function GetTotalDurationOfStyleStatesWithDuration(items: TStyleStateWithDuration[]): number {
  return items.reduce((total: number, item: TStyleStateWithDuration) => {
    return total + item.duration;
  }, 0);
}

export function CreateSequentialAnimateFunctionFromStyleStatesWithDurationRequiringFutureDurationAndHTMLElements(
  items: Iterable<TStyleStateWithDuration>
): TAnimateFunctionRequiringFutureDurationAndHTMLElements<[]> {
  const _items: TStyleStateWithDuration[] = ArrayFrom(items);
  const length: number = _items.length;

  if (length < 2) {
    throw new Error(`Min 2 states required`);
  } else if (_items[0].duration !== 0) {
    throw new Error(`The first state must have a duration of 0`);
  } else if (_items[0].timingFunction !== void 0) {
    throw new Error(`The first state must not have a timing function`);
  } else {
    const total: number = GetTotalDurationOfStyleStatesWithDuration(_items);
    const weightedAnimateFunctions: [TAnimateFunctionRequiringFutureDurationAndHTMLElements<[]>, number][] = [];
    for (let i = 1; i < length; i++) {
      const stateA: TStyleStateWithDuration = _items[i - 1];
      const stateB: TStyleStateWithDuration = _items[i];
      weightedAnimateFunctions.push([
        CreateAnimateFunctionFromAnimationRequiringFutureDuration<[HTMLElementArray]>(
          CreateCSSAnimation(stateA.state, stateB.state, stateB.timingFunction),
        ),
        (stateB.duration / total),
      ]);
    }

    return CreateSequentialWeightedAnimateFunctionWithFutureDuration<[HTMLElementArray]>(weightedAnimateFunctions);
  }
}

// /**
//  * Creates an <animate function> which runs in sequence many <animations>, each having a specific duration
//  */
// export function CreateSequentialAnimateFunctionFromStatesWithDuration(
//   items: Iterable<TStateWithDuration>
// ): TAnimateFunctionRequiringFutureHTMLElements<[]> {
//   const _items: TStateWithDuration[] = ArrayFrom(items);
//   const total: number = GetTotalDurationOfStatesWithDuration(_items);
//   return SetDurationOfAnimateFunctionRequiringFutureDuration<[THTMLElements]>(
//     CreateSequentialAnimateFunctionFromStatesWithDurationRequiringFutureDurationAndHTMLElements(_items),
//     total
//   );
// }

export function CreateSequentialAnimateFunctionFromStyleStates<GOptions extends IReduceAnimateFunctionOptions>(
  items: Iterable<TStyleStateWithDuration>,
  options?: GOptions,
): TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult<[], GOptions> {
  const _items: TStyleStateWithDuration[] = ArrayFrom(items);

  const duration: number | undefined = (IsObject(options) && (typeof options.duration === 'number'))
    ? (options.duration <= 0)
      ? GetTotalDurationOfStyleStatesWithDuration(_items)
      : options.duration
    : void 0;

  return ReduceAnimateFunctionRequiringFutureDurationAndHTMLElements<[], GOptions>(
    CreateSequentialAnimateFunctionFromStyleStatesWithDurationRequiringFutureDurationAndHTMLElements(_items),
    {
      ...options,
      duration
    } as GOptions
  );
}
