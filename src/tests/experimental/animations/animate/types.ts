import { ICancellablePromise, ICancellablePromiseOptions } from '@lifaon/observables';
import { THTMLElements } from '../animations/types';

/**
 * INFO: a <animate function> is a function executing some action(s) depending on the elapsed time, and returns a fulfilled promised when finished
 * @example: (elements: HTMLElement[]) => moveElements(elements)
 */

export type TAnimateFunction<GArgs extends any[]> = (options?: ICancellablePromiseOptions, ...args: GArgs) => ICancellablePromise<void>;

export type TAnimateFunctionRequiringFutureDuration<GArgs extends any[]> = TAnimateFunction<[number, ...GArgs]>;

export type TAnimateFunctionRequiringFutureHTMLElements<GArgs extends any[]> = TAnimateFunction<[THTMLElements, ...GArgs]>;
export type TAnimateFunctionRequiringFutureDurationAndHTMLElements<GArgs extends any[]> = TAnimateFunction<[number, THTMLElements, ...GArgs]>;

export type TOptionalDuration = (number | void);

// export type TInferAnimateFunctionFromOptionalDuration<GArgs extends any[], TDuration extends TOptionalDuration> = TDuration extends void
//   ? TAnimateFunctionRequiringFutureDuration<GArgs>
//   : TAnimateFunction<GArgs>;


/*--*/

export interface IReduceAnimateFunctionDurationOptions {
  duration?: number;
}


export interface IReduceAnimateFunctionElementsOptions {
  elements?: THTMLElements;
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
  GOptions['elements'] extends THTMLElements
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


export type TInferReduceAnimateFunctionResultArguments<GArgs extends any[], GOptions extends IReduceAnimateFunctionOptions> =
  TReduceAnimateFunctionElementsOrQuerySelectorOptionsContainsElements<GOptions> extends true
    ? (
      TReduceAnimateFunctionDurationOptionsContainsDuration<GOptions> extends true
        ? GArgs
        : [number, ...GArgs]
      ) : (
      TReduceAnimateFunctionDurationOptionsContainsDuration<GOptions> extends true
        ? [THTMLElements, ...GArgs]
        : [number, THTMLElements, ...GArgs]
      );

export type TInferReduceAnimateFunctionResult<GArgs extends any[], GOptions extends IReduceAnimateFunctionOptions> =
  TAnimateFunction<TInferReduceAnimateFunctionResultArguments<GArgs, GOptions>>;



export type TInferReduceAnimationFunctionResult<GArgs extends any[], GOptions extends IReduceAnimateFunctionOptions> =
  TInferReduceAnimateFunctionResult<[THTMLElements, ...GArgs], GOptions>;

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

