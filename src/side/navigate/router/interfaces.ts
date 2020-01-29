import { IComponentRoute } from '../component-route/interfaces';
import { INavigation } from '../navigation/interfaces';
import { INavigationNavigateOptions } from '../navigation/types';

/** TYPES **/

export interface IRouterOptions {
  route: IComponentRoute; // INFO: IComponentRoute is forced to ensure that / (root) always bind to a component
}

export interface IRouterNavigateOptions extends INavigationNavigateOptions {
}

/** INTERFACES **/

export interface IRouterStatic {
  create(options?: IRouterOptions): IRouter;
}

export interface IRouterConstructor extends IRouterStatic {
  new(options?: IRouterOptions): IRouter;
}

/**
 * Allows to navigate on an application by changing the URL
 */
export interface IRouter extends IRouterOptions {
  readonly route: IComponentRoute;
  readonly navigation: INavigation;

  navigate(url: string | URL, options?: IRouterNavigateOptions): Promise<void>;
}

