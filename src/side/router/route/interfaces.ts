import { IPathMatcher } from '../path-matcher/interfaces';
import { IReadonlyList } from '@lifaon/observables';
import { IRoutePath } from './route-path/interfaces';
import { IRouteOptions, TRouteExec, TRouteExecMode, TRouteExecParamsMode } from './types';

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



