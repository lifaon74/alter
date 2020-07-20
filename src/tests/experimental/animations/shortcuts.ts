import { TAnimationFunction, THTMLElementsAnimationFunction, TStyleState, TStyleStateMap } from './animations/types';
import { CreateCSSAnimation, NormalizeStyleState } from './animations/animations';
import { TTimingFunction, TTimingFunctionOrName } from './timing-functions/types';
import { TimingFunctionOrNameToTimingFunction } from './timing-functions/timing-functions';
import { TAnimateFunction } from './animate/types';
import {
  CreateAnimateFunctionFromAnimation, CreateAnimateFunctionFromHTMLElementsAnimation, CreateDelayAnimateFunction,
  CreateLoopAnimateFunction, CreateParallelAnimateFunction, CreateSequentialAnimateFunction
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
): THTMLElementsAnimationFunction {
  return CreateCSSAnimation(origin, target, timingFunction);
}

export function animate<TArgs extends any[]>(
  animation: TAnimationFunction<TArgs>,
  duration: number,
): TAnimateFunction<TArgs> {
  return CreateAnimateFunctionFromAnimation<TArgs>(animation, duration);
}

export function animate_elements(
  animation: THTMLElementsAnimationFunction,
  duration: number,
  elements: ArrayLike<HTMLElement> | string,
): TAnimateFunction<[]> {
  return CreateAnimateFunctionFromHTMLElementsAnimation(animation, duration, elements);
}


export function animate_delay(timeout: number): TAnimateFunction<[]> {
  return CreateDelayAnimateFunction(timeout);
}

export function animate_loop<TArgs extends any[]>(
  animateFunction: TAnimateFunction<TArgs>
): TAnimateFunction<TArgs> {
  return CreateLoopAnimateFunction(animateFunction);
}

export function animate_par<TArgs extends any[]>(
  animateFunctions: TAnimateFunction<TArgs>[],
): TAnimateFunction<TArgs> {
  return CreateParallelAnimateFunction(animateFunctions);
}

export function animate_seq<TArgs extends any[]>(
  animateFunctions: TAnimateFunction<TArgs>[],
): TAnimateFunction<TArgs> {
  return CreateSequentialAnimateFunction<TArgs>(animateFunctions);
}
