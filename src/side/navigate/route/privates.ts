import { IRoute } from './interfaces';
import { IPathMatcher } from '../path-matcher/interfaces';
import { IReadonlyList } from '@lifaon/observables';
import { InferChildRoute, TRouteExecGeneric, TRouteExecMode, TRouteExecParamsMode, TRouteResolve } from './types';

/** PRIVATES **/

export const ROUTE_PRIVATE = Symbol('route-private');

export interface IRoutePrivate<TExec extends TRouteExecGeneric> {
  pathMatcher: IPathMatcher;
  children: IReadonlyList<InferChildRoute<TExec>>;
  resolve: TRouteResolve<TExec> | null;
  exec: TExec | null;
  execMode: TRouteExecMode | null;
  execParamsMode: TRouteExecParamsMode | null;
}

export interface IRoutePrivatesInternal<TExec extends TRouteExecGeneric> {
  [ROUTE_PRIVATE]: IRoutePrivate<TExec>;
}

export interface IRouteInternal<TExec extends TRouteExecGeneric> extends IRoutePrivatesInternal<TExec>, IRoute<TExec> {
}
