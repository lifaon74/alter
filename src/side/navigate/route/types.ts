import { IPathMatcherResult, TPathMatcherParams } from '../path-matcher/types';
import { ICancellablePromiseOptions, TAbortStrategy, TPromiseOrValue } from '@lifaon/observables';
import { IRoute } from './interfaces';

/** TYPES */

export type TRouteExecGeneric = <TStrategy extends TAbortStrategy>(this: IRoute<TRouteExecGeneric>, params: IRouteExecParams<any, TStrategy>) => TPromiseOrValue<any>;

export type InferRouteExecValue<TExec extends TRouteExecGeneric> = TExec extends ((params: IRouteExecParams<infer TExecValue, TAbortStrategy>) => TPromiseOrValue<any>) ? TExecValue : never;
// export type TRouteExecStrategy<TExec extends TRouteExecGeneric> = TExec extends ((params: IRouteExecParams<any, infer TExecStrategy>) => TPromiseOrValue<any>) ? TExecStrategy extends TAbortStrategy ? TExecStrategy : 'never' : never;
export type InferRouteExecReturnValue<TExec extends TRouteExecGeneric> = TExec extends ((params: IRouteExecParams<any, TAbortStrategy>) => TPromiseOrValue<infer TExecReturn>) ? TExecReturn : never;

// export type TRouteExecParams<TExec extends TRouteExecGeneric> = IRouteExecParams<TRouteExecValue<TExec>, TRouteExecStrategy<TExec>>;
export type InferChildRouteExec<TExec extends TRouteExecGeneric> = <TStrategy extends TAbortStrategy>(this: IRoute<InferChildRouteExec<TExec>>, params: IRouteExecParams<InferRouteExecReturnValue<TExec>, TStrategy>) => TPromiseOrValue<any>;
export type InferChildRoute<TExec extends TRouteExecGeneric> = IRoute<InferChildRouteExec<TExec>>;

export type TRouteResolve<TExec extends TRouteExecGeneric> = (this: IRoute<TExec>, params: IPathMatcherResult) => TPromiseOrValue<boolean>;

export interface IRouteExecParams<TExecValue, TStrategy extends TAbortStrategy> extends ICancellablePromiseOptions<TStrategy> {
  params: TPathMatcherParams;
  parentValue: TExecValue;
}

// const a:TRouteExecStrategy<() => {}>;

export type TRouteExecMode =
  'partial' // exec is called even if it's not the last route of the IRoutePath
  | 'final';  // (default) exec is called only if it's the last route of the IRoutePath

export type TRouteExecParamsMode =
  'own' // exec receives only own params
  | 'parents';  // (default) exec receives params composed of own params and all it's parents

export interface IRouteOptions<TExec extends TRouteExecGeneric> {
  children?: Iterable<InferChildRoute<TExec>>;
  resolve?: TRouteResolve<TExec>; // callback called when the Route is resolving
  exec?: TExec; // callback called when the Route is fully resolved
  execMode?: TRouteExecMode; // (default: 'final')
  execParamsMode?: TRouteExecParamsMode; // (default: 'parents')
}
