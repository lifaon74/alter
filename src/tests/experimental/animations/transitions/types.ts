import { TProgression } from '../types';


export type TTransitionFunction<T> = (progression: TProgression) => T;
export type TInferTransitionFunctionType<T extends TTransitionFunction<any>> = T extends TTransitionFunction<infer U>
  ? U
  : never;

export type TDynamicTransitionValue<T> = T | (() => T);
