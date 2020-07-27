import { TTimingFunction, TTimingFunctionOrName } from './timing-functions/types';
import { TimingFunctionOrNameToTimingFunction } from './timing-functions/timing-functions';
import { NormalizeStyleState } from './style-state/style-state';
import { TStyleState, TStyleStateMap } from './style-state/types';
import { TAnimationFunctionRequiringFutureHTMLElements } from './animations/types';
import { CreateCSSAnimation } from './animations/css-animations';
import {
  CreateAndReduceAnimateFunctionRequiringFutureHTMLElementsFromAnimation, CreateDelayAnimateFunction,
  CreateLoopAnimateFunction, CreateParallelAnimateFunction, CreateSequentialAnimateFunction,
} from './animate/animate';
import {
  IReduceAnimateFunctionOptions, TAnimateFunction,
  TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult,
  TInferReduceAnimationFunctionRequiringFutureHTMLElementsFromAnimationResult
} from './animate/types';
import {
  CreateSequentialAnimateFunctionFromStyleStates, TStyleStateWithDuration
} from './animate/animate-from-style-states';
import { TScrollDirection, TScrollOptionalValue } from './transitions/scroll';
import { CreateScrollAnimation } from './animations/scroll-animations';


export function css_state(style: TStyleState): TStyleStateMap {
  return NormalizeStyleState(style);
}

export function timing_function(timingFunction: TTimingFunctionOrName): TTimingFunction {
  return TimingFunctionOrNameToTimingFunction(timingFunction);
}

export function css_animation(
  origin: TStyleState,
  target: TStyleState,
  timingFunction?: TTimingFunctionOrName
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return CreateCSSAnimation(origin, target, timingFunction);
}

export function scroll_animation(
  direction: TScrollDirection,
  origin: TScrollOptionalValue,
  target: TScrollOptionalValue,
  timingFunction: TTimingFunctionOrName = 'ease'
): TAnimationFunctionRequiringFutureHTMLElements<[]> {
  return CreateScrollAnimation(direction, origin, target, timingFunction);
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

export function animate_seq_css_states<GOptions extends IReduceAnimateFunctionOptions>(
  items: Iterable<TStyleStateWithDuration>,
  options?: GOptions,
): TInferReduceAnimateFunctionRequiringFutureDurationAndHTMLElementsResult<[], GOptions> {
  return CreateSequentialAnimateFunctionFromStyleStates<GOptions>(items, options);
}
