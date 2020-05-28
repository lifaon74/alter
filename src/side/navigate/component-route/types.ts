import { IRouteExecParams, IRouteOptions } from '../route/types';
import { HTMLElementConstructor } from '../../../core/custom-node/helpers/NodeHelpers';
import { ICancellablePromise, TAbortStrategy } from '@lifaon/observables';
import { IRoute } from '../route/interfaces';

/** TYPES */


export type TComponentRouteExec = (this: IRoute<TComponentRouteExec>, params: IComponentRouteExecParams) => ICancellablePromise<IComponentRouteExecReturn>;

export type TComponentRouteExecValue = IComponentRouteExecReturn | undefined;

export interface IComponentRouteExecReturn {
  parentElement: HTMLElement | null;
}

export interface IComponentRouteExecParams extends IRouteExecParams<TComponentRouteExecValue> {
}

/*---*/

export interface IComponentRouteOptions extends Pick<IRouteOptions<TComponentRouteExec>, 'children'> {
  component: string | HTMLElementConstructor;
  routerId?: string;
}
