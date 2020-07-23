export type TProgression = number; // progression ∈[0, 1]
export enum TProgressionSpecialState {
  START = Number.NEGATIVE_INFINITY,
  END = Number.POSITIVE_INFINITY,
}

export type TProgressionWithSpecialState = TProgression | TProgressionSpecialState;

export type TProgressFunction<GArgs extends any[], GReturn> = (progression: TProgression, ...args: GArgs) => GReturn;
export type TProgressFunctionWithSpecialState<GArgs extends any[], GReturn> = (progression: TProgressionWithSpecialState, ...args: GArgs) => GReturn;

export type TGenericProgressFunction = TProgressFunction<any[], any>;
export type TGenericProgressFunctionWithSpecialState = TProgressFunctionWithSpecialState<any[], any>;

export type TGenerateProgressFunction<GArgs extends any[], GReturn> = (...args: any[]) => TProgressFunction<GArgs, GReturn>;

// export type TInferProgressFunctionArguments<GFnc extends TGenericProgressFunction> =
//   GFnc extends ((progression: TProgression | TProgressionWithState, ...args: infer GArgs) => any)
//     ? GArgs
//     : never;
//
// export type TInferProgressFunctionReturns<GFnc extends TGenericProgressFunction> =
//   GFnc extends ((progression: TProgression | TProgressionWithState, ...args: any[]) => infer GReturn)
//     ? GReturn
//     : never;


export type HTMLElementArray = ArrayLike<HTMLElement>;
