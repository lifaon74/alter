export type TProgression = number; // progression ∈[0, 1]
export type TAnimationProgressionState = 'start' | 'end';
export type TAnimationProgression = TProgression | TAnimationProgressionState;

export type TProgressFunction<TArgs extends any[], TReturn> = (progression: TProgression, ...args: TArgs) => TReturn;
export type TAnimationProgressFunction<TArgs extends any[], TReturn> = (progression: TAnimationProgression, ...args: TArgs) => TReturn;

export type TGenericProgressFunction = TProgressFunction<any[], any>;
export type TGenericAnimationProgressFunction = TAnimationProgressFunction<any[], any>;

export type TInferProgressFunctionArguments<TFnc extends TGenericProgressFunction> =
  TFnc extends ((progression: TProgression | TAnimationProgression, ...args: infer TArgs) => any)
    ? TArgs
    : never;

export type TInferProgressFunctionReturns<TFnc extends TGenericProgressFunction> =
  TFnc extends ((progression: TProgression | TAnimationProgression, ...args: any[]) => infer TReturn)
    ? TReturn
    : never;
