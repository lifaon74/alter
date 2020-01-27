import { IRoutePathEntry } from './types';
import { IRoutePath } from './interfaces';

/** PRIVATES **/

export const ROUTE_PATH_PRIVATE = Symbol('route-path-private');

export interface IRoutePathPrivate {
  routePath: IRoutePathEntry[];
}

export interface IRoutePathPrivatesInternal {
  [ROUTE_PATH_PRIVATE]: IRoutePathPrivate;
}

export interface IRoutePathInternal extends IRoutePathPrivatesInternal, IRoutePath {
}
