import { TAnimationProgressFunction } from '../types';

/**
 * INFO: an <animation> is a function executing some action(s) depending on a 'progression'
 * @example: progression => element.style.setProperty('width', `${ progression * 400 }px`)
 */
export type TAnimationFunction<GArgs extends any[]> = TAnimationProgressFunction<GArgs, void>;

// a <html element animation> is a specific <animation>, which accepts a list of elements
export type THTMLElements = ArrayLike<HTMLElement>;
export type TAnimationFunctionRequiringFutureHTMLElements<GArgs extends any[]> = TAnimationFunction<[THTMLElements, ...GArgs]>;

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

