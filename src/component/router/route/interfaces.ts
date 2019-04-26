import { IPathMatcher, IPathMatcherParams } from '../../path-matcher/interfaces';
import { INotificationsObservable, INotificationsObservableContext, IReadonlyList } from '@lifaon/observables/public';
import { Constructor } from '../../../classes/factory';

// export type TRouteNotificationNames = 'activate';
// export type TRouteNotificationValue = any;

export interface IRouteKeyValueMap {
  activate: any;
}

export type TRouteContext = INotificationsObservableContext<IRouteKeyValueMap>;

export interface IRoute extends INotificationsObservable<IRouteKeyValueMap> {
  readonly children: IReadonlyList<IRoute>;
  readonly pathMatcher: IPathMatcher;
  readonly component: string | null;
  readonly routerId: string | null;
}

export interface IRouteOptions {
  path: string;
  component?: string | Constructor<HTMLElement> | null;
  children?: Iterable<IRoute>;
  routerId?: string | null;
  /**
   * @deprecated not implemented yet
   */
  redirectTo?: string | null;
}

export type IRoutePathEntry = {
  route: IRoute;
  params: IPathMatcherParams;
};

export type TRoutePath = IRoutePathEntry[];
