import { ICancellablePromise, ICancellablePromiseOptions } from '@lifaon/observables';
import { HTMLElementArray } from '../types';


/**
 * INFO: a <animate function> is a function executing some action(s) depending on the elapsed time, and returns a fulfilled promised when finished
 * @example: (elements: HTMLElement[]) => moveElements(elements)
 */

export type TAnimateFunction<GArgs extends any[]> = (options?: ICancellablePromiseOptions, ...args: GArgs) => ICancellablePromise<void>;

export type TInferAnimateFunctionArguments<GAnimateFunction extends TAnimateFunction<any[]>> =
  GAnimateFunction extends TAnimateFunction<infer GArgs>
    ? GArgs
    : any;

/* SHORTCUTS */

export type TAnimateFunctionRequiringFutureDurationArguments<GArgs extends any[]> = [number, ...GArgs];
export type TAnimateFunctionRequiringFutureHTMLElementsArguments<GArgs extends any[]> = [HTMLElementArray, ...GArgs];
export type TAnimateFunctionRequiringFutureDurationAndHTMLElementsArguments<GArgs extends any[]> = [number, HTMLElementArray, ...GArgs];

export type TAnimateFunctionRequiringFutureDuration<GArgs extends any[]> = TAnimateFunction<TAnimateFunctionRequiringFutureDurationArguments<GArgs>>;
export type TAnimateFunctionRequiringFutureHTMLElements<GArgs extends any[]> = TAnimateFunction<TAnimateFunctionRequiringFutureHTMLElementsArguments<GArgs>>;
export type TAnimateFunctionRequiringFutureDurationAndHTMLElements<GArgs extends any[]> = TAnimateFunction<TAnimateFunctionRequiringFutureDurationAndHTMLElementsArguments<GArgs>>;


export type TInferAnimateFunctionRequiringFutureDurationAndHTMLElementsArguments<GAnimateFunction extends TAnimateFunctionRequiringFutureDurationAndHTMLElements<any[]>> =
  GAnimateFunction extends TAnimateFunctionRequiringFutureDurationAndHTMLElements<infer GArgs>
    ? GArgs
    : any;


/*--*/

export interface IReduceAnimateFunctionDurationOptions {
  duration?: number;
}


export interface IReduceAnimateFunctionElementsOptions {
  elements?: HTMLElementArray;
}

export interface IReduceAnimateFunctionQuerySelectorOptions {
  selector?: string;
  parentElement?: ParentNode;
}

export interface IReduceAnimateFunctionElementsOrQuerySelectorOptions extends IReduceAnimateFunctionElementsOptions,
  IReduceAnimateFunctionQuerySelectorOptions {
}

export interface IReduceAnimateFunctionOptions extends IReduceAnimateFunctionDurationOptions, IReduceAnimateFunctionElementsOrQuerySelectorOptions {
}


export type TReduceAnimateFunctionElementsOrQuerySelectorOptionsContainsElements<GOptions extends IReduceAnimateFunctionElementsOrQuerySelectorOptions> =
  GOptions['elements'] extends HTMLElementArray
    ? true
    : (
      GOptions['selector'] extends string
        ? true
        : false
      );

export type TReduceAnimateFunctionDurationOptionsContainsDuration<GOptions extends IReduceAnimateFunctionDurationOptions> =
  GOptions['duration'] extends number
    ? true
    : false;


// INFO: GArgs are arguments of TAnimateFunctionRequiringFutureDurationAndHTMLElements without [number, THTMLElements, ...GArgs]
export type TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResultArguments<GArgs extends any[], GOptions extends IReduceAnimateFunctionOptions> =
  TReduceAnimateFunctionElementsOrQuerySelectorOptionsContainsElements<GOptions> extends true
    ? (
      TReduceAnimateFunctionDurationOptionsContainsDuration<GOptions> extends true
        ? GArgs
        : [number, ...GArgs]
      ) : (
      TReduceAnimateFunctionDurationOptionsContainsDuration<GOptions> extends true
        ? [HTMLElementArray, ...GArgs]
        : [number, HTMLElementArray, ...GArgs]
      );


// INFO: GArgs are arguments of TAnimateFunctionRequiringFutureDurationAndHTMLElements without [number, THTMLElements, ...GArgs]
export type TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult<GArgs extends any[],
  GOptions extends IReduceAnimateFunctionOptions> =
  TAnimateFunction<TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResultArguments<GArgs, GOptions>>;


// INFO: GArgs are arguments of TAnimationFunctionRequiringFutureHTMLElements without [THTMLElements, ...GArgs]
export type TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult<GArgs extends any[],
  GOptions extends IReduceAnimateFunctionOptions> =
  TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult<GArgs, GOptions>;


// const a: TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult<TAnimationFunction<[]>, {}> = null as any;
// const a: TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult<TAnimationFunctionRequiringFutureHTMLElements<[]>, {}> = null as any;
// const b: (((...args: []) => void) extends ((...args: [number, ...any[]]) => void) ? true : false) = null as any;
// const b: (((...args: []) => void) extends ((...args: [number]) => void) ? true : false) = null as any;


// export type TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult<GArgs extends any[], GOptions extends IReduceAnimateFunctionOptions> =
//   TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult<GArgs, GOptions>;

// const a0: TInferReduceAnimateFunctionResultArguments<[], void> = null as any;

// const a0: TInferReduceAnimateFunctionDuration<[number, string], {}> = null as any; // [number, string]
// const a1: TInferReduceAnimateFunctionDuration<[number, string], { duration: 10 }> = null as any;  // [string]
//
// const b0: TInferReduceAnimateFunctionElements<[THTMLElements, string], {}> = null as any; // [THTMLElements, string]
// const b1: TInferReduceAnimateFunctionElements<[THTMLElements, string], { elements: THTMLElements }> = null as any; // [string]
//
// const c0: TInferReduceAnimateFunctionDurationAndElements<[number, THTMLElements, string], {}> = null as any; // [number, THTMLElements, string]
// const c1: TInferReduceAnimateFunctionDurationAndElements<[number, string], {}> = null as any; // [number, string]
// const c2: TInferReduceAnimateFunctionDurationAndElements<[THTMLElements, string], {}> = null as any; // [THTMLElements, string]
//
// const d0: TInferReduceAnimateFunctionDurationAndElements<[number, THTMLElements, string], { duration: 10 }> = null as any; // [THTMLElements, string]
// const d1: TInferReduceAnimateFunctionDurationAndElements<[number, string], { duration: 10 }> = null as any; // [string]
// const d2: TInferReduceAnimateFunctionDurationAndElements<[THTMLElements, string], { duration: 10 }> = null as any; // [THTMLElements, string]
//
// const e0: TInferReduceAnimateFunctionDurationAndElements<[number, THTMLElements, string], { elements: THTMLElements }> = null as any; // [number, THTMLElements, string]
// const e1: TInferReduceAnimateFunctionDurationAndElements<[number, string], { elements: THTMLElements }> = null as any; // [number, string]
// const e2: TInferReduceAnimateFunctionDurationAndElements<[THTMLElements, string], { elements: THTMLElements }> = null as any; // [string]

// const f0: TInferReduceAnimateFunctionDurationAndElements<[number, THTMLElements, string], { duration: 10; elements: THTMLElements }> = null as any; // [string]
// const f1: TInferReduceAnimateFunctionDurationAndElements<[number, string], { duration: 10; elements: THTMLElements }> = null as any; // [string]
// const f2: TInferReduceAnimateFunctionDurationAndElements<[THTMLElements, string], { duration: 10; elements: THTMLElements }> = null as any; // [string]
//
//
// const z0: TInferReduceAnimateFunctionResult<TAnimateFunctionRequiringFutureDuration<[THTMLElements]>, { duration: 10 }> = null as any;

