import { IRoute } from '../route/interfaces';
import { IComponentRouteOptions, TComponentRouteExec } from './types';

/** INTERFACES */

export interface IComponentRouteConstructor {
  new(path: string, options?: IComponentRouteOptions): IComponentRoute;
}

export interface IComponentRoute extends IRoute<TComponentRouteExec> {
  readonly component: string;
  readonly routerId: string | null;
}



