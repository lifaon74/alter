import { TProgressFunction } from '../types';

/**
 * INFO: a <transition> is a function transforming a 'progression' into another value
 * @example: progression => `${ progression * 400 }px`
 */

export type TTransitionFunction<T> = TProgressFunction<[], T>;

export type TInferTransitionFunctionType<TFnc extends TTransitionFunction<any>> = TFnc extends TTransitionFunction<infer T>
  ? T
  : never;

// export type TDynamicTransitionValue<T> = T | (() => T);
