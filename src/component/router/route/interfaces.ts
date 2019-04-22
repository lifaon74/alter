import { IPathMatcher, IPathMatcherParams } from '../../path-matcher/interfaces';
import { HTMLElementConstructor } from '../../../custom-node/helpers/NodeHelpers';
import { INotificationsObservable, INotificationsObservableContext, IReadonlyList } from '@lifaon/observables/public';

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
  component?: string | HTMLElementConstructor | null;
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
