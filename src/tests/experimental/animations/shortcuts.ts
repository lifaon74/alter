import {
  TAnimationFunction, TAnimationFunctionRequiringFutureHTMLElements, TStyleState, TStyleStateMap
} from './animations/types';
import { CreateCSSAnimation, NormalizeStyleState } from './animations/animations';
import { TTimingFunction, TTimingFunctionOrName } from './timing-functions/types';
import { TimingFunctionOrNameToTimingFunction } from './timing-functions/timing-functions';
import {
  IReduceAnimateFunctionOptions, TAnimateFunction, TAnimateFunctionRequiringFutureDurationAndHTMLElements,
  TAnimateFunctionRequiringFutureHTMLElements,
  TInferReduceAnimateFunctionResult,
  TInferReduceAnimationFunctionResult
} from './animate/types';
import {
  CreateAndReduceAnimateFunctionFromAnimation, CreateDelayAnimateFunction, CreateLoopAnimateFunction,
  CreateParallelAnimateFunction, CreateSequentialAnimateFunction, CreateSequentialAnimateFunctionFromStates,
  TStateWithDuration
} from './animate/animate';


export function state(style: TStyleState): TStyleStateMap {
  return NormalizeStyleState(style);
}

export function timingFunction(timingFunction: TTimingFunctionOrName): TTimingFunction {
  return TimingFunctionOrNameToTimingFunction(timingFunction);
}

export function animation(
  origin: TStyleState,
  target: TStyleState,
  timingFunction?: TTimingFunctionOrName
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return CreateCSSAnimation(origin, target, timingFunction);
}


export function animate<GArgs extends any[], GOptions extends IReduceAnimateFunctionOptions>(
  animation: TAnimationFunctionRequiringFutureHTMLElements<GArgs>,
  options?: GOptions,
): TInferReduceAnimationFunctionResult<GArgs, GOptions> {
  return CreateAndReduceAnimateFunctionFromAnimation<GArgs, GOptions>(animation, options);
}


export function animate_delay(timeout: number): TAnimateFunction<[]> {
  return CreateDelayAnimateFunction(timeout);
}

export function animate_loop<GArgs extends any[]>(
  animateFunction: TAnimateFunction<GArgs>
): TAnimateFunction<GArgs> {
  return CreateLoopAnimateFunction(animateFunction);
}

export function animate_par<GArgs extends any[]>(
  animateFunctions: TAnimateFunction<GArgs>[],
): TAnimateFunction<GArgs> {
  return CreateParallelAnimateFunction(animateFunctions);
}

export function animate_seq<GArgs extends any[]>(
  animateFunctions: TAnimateFunction<GArgs>[],
): TAnimateFunction<GArgs> {
  return CreateSequentialAnimateFunction<GArgs>(animateFunctions);
}

export function animate_seq_states<GOptions extends IReduceAnimateFunctionOptions>(
  items: Iterable<TStateWithDuration>,
  options?: GOptions,
): TInferReduceAnimateFunctionResult<[], GOptions> {
  return CreateSequentialAnimateFunctionFromStates<GOptions>(items, options);
}
