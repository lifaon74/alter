import { INavigationNavigateOptions } from './navigation/interfaces';
import { IRoute } from './route/interfaces';
import { IPathMatcherParams } from './path-matcher/interfaces';
import { IReadonlyList } from '@lifaon/observables/public';


export interface IRouterNavigateOptions extends INavigationNavigateOptions {
}

export type IRouterRoutePathParams = IPathMatcherParams;


export interface IRouter {
  readonly routes: IReadonlyList<IRoute>;
}
