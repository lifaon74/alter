import { IPathMatcher } from '../path-matcher/interfaces';
import { IReadonlyList } from '@lifaon/observables';
import { IRoutePath } from './route-path/interfaces';
import { IRouteOptions, InferChildRoute, TRouteExecGeneric, TRouteExecMode, TRouteExecParamsMode } from './types';

/** INTERFACES */

export interface IRouteConstructor {
  new<TExec extends TRouteExecGeneric>(path: string, options?: IRouteOptions<TExec>): IRoute<TExec>;
}

export interface IRoute<TExec extends TRouteExecGeneric> {
  readonly children: IReadonlyList<InferChildRoute<TExec>>;
  readonly pathMatcher: IPathMatcher;
  readonly exec: TExec | null;
  readonly execMode: TRouteExecMode | null;
  readonly execParamsMode: TRouteExecParamsMode | null;

  resolve(path: string): Promise<IRoutePath | null>;
}



