import { TProgressFunction, TProgression } from '../types';

/**
 * INFO: a <timing function> is a function mapping a 'progression' to another
 * @example: 'linear': progression => progression
 */

export type TTimingFunction = TProgressFunction<[], TProgression>;
export type TTimingFunctionOrName = TTimingFunction | TTimingFunctionName;

export type TTimingFunctionName =
  'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';
