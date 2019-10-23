import { INavigationNavigateOptions } from './navigation/interfaces';
import { IRoute } from './route/interfaces';
import { IPathMatcherParams } from './path-matcher/interfaces';
import { IReadonlyList } from '@lifaon/observables';


export interface IRouterNavigateOptions extends INavigationNavigateOptions {
}

export type IRouterRoutePathParams = IPathMatcherParams;

export type IRoutePathEntry = {
  route: IRoute;
  params: IPathMatcherParams;
};
export type TRoutePath = IRoutePathEntry[];


export interface IRouterConstructor {
  new(routes: Iterable<IRoute>): IRouter;
}

export interface IRouter {
  readonly routes: IReadonlyList<IRoute>;
}

