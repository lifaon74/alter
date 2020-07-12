import { TAnimationProgressFunction, TProgressFunction, TProgression } from '../types';

/**
 * INFO: an <animation> is a function executing some action(s) depending on a 'progression'
 * @example: progression => element.style.setProperty('width', `${ progression * 400 }px`)
 */
export type TAnimationFunction<TArgs extends any[]> = TAnimationProgressFunction<TArgs, void>;

// a <html element animation> is a specific <animation>, which accepts a list of elements
export type THTMLElementsAnimationFunction = TAnimationFunction<[ArrayLike<HTMLElement>]>;

/*---*/

export type TStylePropertyName = string;
export type TStylePropertyValue =
  string // any css value
  | undefined // compute css current value
  | null // remove property
  | 'auto'; // set value to 'auto', then compute css current value

export type TStylePropertyTuple = [TStylePropertyName, TStylePropertyValue];

export interface TStyleStateObject {
  [key: string]: TStylePropertyValue;
}


export type TStyleStateTuples = Iterable<TStylePropertyTuple>;
export type TStyleStateMap = Map<TStylePropertyName, TStylePropertyValue>;

export type TStyleState = TStyleStateObject | TStyleStateTuples;

export type TStylePropertyChangeMap = Map<TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]>; // [name, [origin, target]]


// export type TAnimationWithWeightTuple = [TAnimationFunction, number];
//
// export interface TAnimationWithWeightObject {
//   animation: TAnimationFunction;
//   weight: number;
// }
//
// export type TAnimationWithWeight = TAnimationWithWeightTuple | TAnimationWithWeightObject;
//
// export interface TAnimationWithProgressRange extends TAnimationWithWeightObject {
//   startProgress: number;
//   endProgress: number;
// }
