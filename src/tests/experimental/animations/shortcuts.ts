import { TTimingFunction, TTimingFunctionOrName } from './timing-functions/types';
import { TimingFunctionOrNameToTimingFunction } from './timing-functions/timing-functions';
import { NormalizeStyleState } from './style-state/style-state';
import { TStyleState, TStyleStateMap } from './style-state/types';
import { TAnimationFunctionRequiringFutureHTMLElements } from './animations/types';
import { CreateCSSAnimation } from './animations/animations';
import {
  CreateAndReduceAnimateFunctionRequiringFutureHTMLElementsFromAnimation, CreateDelayAnimateFunction,
  CreateLoopAnimateFunction, CreateParallelAnimateFunction, CreateSequentialAnimateFunction,
  CreateSequentialAnimateFunctionFromStates, TStateWithDuration
} from './animate/animate';
import {
  IReduceAnimateFunctionOptions, TAnimateFunction,
  TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult,
  TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult
} from './animate/types';


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
): TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult<GArgs, GOptions> {
  return CreateAndReduceAnimateFunctionRequiringFutureHTMLElementsFromAnimation<GArgs, GOptions>(animation, options);
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
): TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult<[], GOptions> {
  return CreateSequentialAnimateFunctionFromStates<GOptions>(items, options);
}
