import { IComponentRoute } from './interfaces';
import { IAdvancedAbortController } from '@lifaon/observables';
import { IComponentRouteExecReturn } from './types';

/** PRIVATES **/


export const COMPONENT_ROUTE_PRIVATE = Symbol('component-route-private');

export interface IComponentRoutePrivate {
  component: string;
  routerId: string | null;
  pendingExec: Promise<IComponentRouteExecReturn>;
  pendingExecAbortController: IAdvancedAbortController | null;
}

export interface IComponentRoutePrivatesInternal {
  [COMPONENT_ROUTE_PRIVATE]: IComponentRoutePrivate;
}

export interface IComponentRouteInternal extends IComponentRoutePrivatesInternal, IComponentRoute {
}
