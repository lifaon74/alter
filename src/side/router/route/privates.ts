import { IRoute } from './interfaces';
import { IPathMatcher } from '../path-matcher/interfaces';
import { IReadonlyList } from '@lifaon/observables';
import { TRouteExec, TRouteExecMode, TRouteExecParamsMode, TRouteResolve } from './types';

/** PRIVATES **/

export const ROUTE_PRIVATE = Symbol('route-private');

export interface IRoutePrivate {
  pathMatcher: IPathMatcher;
  children: IReadonlyList<IRoute>;
  resolve: TRouteResolve | null;
  exec: TRouteExec | null;
  execMode: TRouteExecMode | null;
  execParamsMode: TRouteExecParamsMode | null;
}

export interface IRoutePrivatesInternal {
  [ROUTE_PRIVATE]: IRoutePrivate;
}

export interface IRouteInternal extends IRoutePrivatesInternal, IRoute {
}
