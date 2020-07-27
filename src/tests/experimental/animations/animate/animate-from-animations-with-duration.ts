import { TAnimationFunction } from '../animations/types';
import {
  NormalizeIterableOfTupleOrObject, TIterableOfTupleOrObject, TTupleOrObject
} from './normalize-iterable-of-tuple-or-object';
import { TAnimateFunction, TAnimateFunctionRequiringFutureDuration } from './types';
import {
  CreateAnimateFunctionFromAnimationRequiringFutureDuration, CreateSequentialWeightedAnimateFunctionWithFutureDuration,
  SetDurationOfAnimateFunctionRequiringFutureDuration
} from './animate';

export type TAnimationWithDurationKeys = ['animation', 'duration'];

export interface TAnimationWithDurationObject<GArgs extends any[]> {
  animation: TAnimationFunction<GArgs>;
  duration: number;
}

export type TAnimationWithDuration<GArgs extends any[]> = TTupleOrObject<TAnimationWithDurationKeys, TAnimationWithDurationObject<GArgs>>;

export function NormalizeAnimationWithDurationIterable<GArgs extends any[]>(
  items: TIterableOfTupleOrObject<TAnimationWithDurationKeys, TAnimationWithDurationObject<GArgs>>
): TAnimationWithDurationObject<GArgs>[] {
  return NormalizeIterableOfTupleOrObject<TAnimationWithDurationKeys, TAnimationWithDurationObject<GArgs>>(
    ['animation', 'duration'],
    items
  );
}


/**
 * Creates an <animate function> which runs in sequence many <animations>, each having a specific duration scaled in the future
 */
export function CreateSequentialAnimateFunctionFromAnimationsWithDurationRequiringFutureDuration<GArgs extends any[]>(
  items: TIterableOfTupleOrObject<TAnimationWithDurationKeys, TAnimationWithDurationObject<GArgs>>
): TAnimateFunctionRequiringFutureDuration<GArgs> {
  const _items: TAnimationWithDurationObject<GArgs>[] = NormalizeAnimationWithDurationIterable<GArgs>(items);
  const total: number = _items.reduce((total: number, item: TAnimationWithDurationObject<GArgs>) => {
    return total + item.duration;
  }, 0);
  return CreateSequentialWeightedAnimateFunctionWithFutureDuration<GArgs>(
    _items.map((item: TAnimationWithDurationObject<GArgs>) => {
      return [
        CreateAnimateFunctionFromAnimationRequiringFutureDuration<GArgs>(item.animation),
        (item.duration / total),
      ];
    })
  );
}

/**
 * Creates an <animate function> which runs in sequence many <animations>, each having a specific duration
 */
export function CreateSequentialAnimateFunctionFromAnimationsWithDuration<GArgs extends any[]>(
  items: TIterableOfTupleOrObject<TAnimationWithDurationKeys, TAnimationWithDurationObject<GArgs>>
): TAnimateFunction<GArgs> {
  return SetDurationOfAnimateFunctionRequiringFutureDuration<GArgs>(
    CreateSequentialAnimateFunctionFromAnimationsWithDurationRequiringFutureDuration<GArgs>(items),
    -1
  );
}
