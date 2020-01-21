import { IPathMatcher, IPathMatcherResult, TPathMatcherParams } from '../path-matcher/interfaces';
import { IReadonlyList, TPromiseOrValue } from '@lifaon/observables';
import { IRoutePath } from './route-path/interfaces';

/** TYPES */




export type TRouteResolve = (this: IRoute, params: IPathMatcherResult) => TPromiseOrValue<boolean>;

export type TRouteExec = (this: IRoute, params: TPathMatcherParams) => TPromiseOrValue<void>;

export type TRouteExecMode =
  'partial' // exec is called even if it's not the last route of the IRoutePath
  | 'final'; // (default) exec is called only if it's the last route of the IRoutePath

export type TRouteExecParamsMode =
  'own' // exec receives only own params
  | 'parents'; // (default) exec receives params composed of own params and all it's parents

export interface IRouteOptions {
  children?: Iterable<IRoute>;
  resolve?: TRouteResolve; // callback called when the Route is resolving
  exec?: TRouteExec; // callback called when the Route is fully resolved
  execMode?: TRouteExecMode; // (default: 'final')
  execParamsMode?: TRouteExecParamsMode; // (default: 'parents')
}

/** INTERFACES */

export interface IRouteConstructor {
  new(path: string, options?: IRouteOptions): IRoute;
}

export interface IRoute {
  readonly children: IReadonlyList<IRoute>;
  readonly pathMatcher: IPathMatcher;
  readonly exec: TRouteExec | null;
  readonly execMode: TRouteExecMode | null;
  readonly execParamsMode: TRouteExecParamsMode | null;

  resolve(path: string): Promise<IRoutePath | null>;
}



