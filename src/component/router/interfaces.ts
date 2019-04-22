import { INavigationNavigateOptions } from './navigation/interfaces';
import { IReadonlyList } from '../../../misc/readonly-list/interfaces';
import { IRoute } from './route/interfaces';
import { IPathMatcherParams } from '../path-matcher/interfaces';


export interface IRouterNavigateOptions extends INavigationNavigateOptions {
}

export type IRouterRoutePathParams = IPathMatcherParams;


export interface IRouter {
  readonly routes: IReadonlyList<IRoute>;
}
