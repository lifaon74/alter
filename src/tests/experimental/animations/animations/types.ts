import { HTMLElementArray, TProgressFunctionWithSpecialState } from '../types';

/**
 * INFO: an <animation> is a function executing some action(s) depending on a 'progression'
 * @example: progression => element.style.setProperty('width', `${ progression * 400 }px`)
 */

export type TAnimationFunction<GArgs extends any[]> = TProgressFunctionWithSpecialState<GArgs, void>;

export type TInferAnimationFunctionArguments<GAnimationFunction extends TAnimationFunction<any[]>> =
  GAnimationFunction extends TAnimationFunction<infer GArgs>
    ? GArgs
    : any;

/* SHORTCUTS */

// a <html element animation> is a specific <animation>, which accepts a list of elements
export type TAnimationFunctionRequiringFutureHTMLElementsArguments<GArgs extends any[]> = [HTMLElementArray, ...GArgs];
export type TAnimationFunctionRequiringFutureHTMLElements<GArgs extends any[]> = TAnimationFunction<TAnimationFunctionRequiringFutureHTMLElementsArguments<GArgs>>;
export type TInferAnimationFunctionRequiringFutureHTMLElementsArguments<GArgs extends TAnimationFunctionRequiringFutureHTMLElementsArguments<any[]>> =
  GArgs extends TAnimationFunctionRequiringFutureHTMLElementsArguments<infer GSubArgs>
    ? GSubArgs
    : never;


