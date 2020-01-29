import { IComponentRoute} from './interfaces';
import { Route } from '../route/implementation';
import {
  AbortReason, AdvancedAbortController, CancellablePromise, IAdvancedAbortController, ICancellablePromise,
  TAbortStrategy, IAdvancedAbortSignal
} from '@lifaon/observables';
import { COMPONENT_ROUTE_PRIVATE, IComponentRouteInternal, IComponentRoutePrivate } from './privates';
import { InjectComponentInRouter } from './functions';
import { ConstructComponentRoute } from './constructor';
import {
  IComponentRouteExecParams,
  IComponentRouteExecReturn, IComponentRouteOptions, TComponentRouteExec, TComponentRouteExecValue
} from './types';

/**
 * TODO:
 *  - think about a better 'exec' pipeline
 */

/** CONSTRUCTOR FUNCTIONS **/

export function ComponentRouteExec<TStrategy extends TAbortStrategy>(instance: IComponentRoute, params: IComponentRouteExecParams<TStrategy>): ICancellablePromise<IComponentRouteExecReturn, TStrategy> {
  const privates: IComponentRoutePrivate = (instance as IComponentRouteInternal)[COMPONENT_ROUTE_PRIVATE];
  if (privates.pendingExecAbortController !== null) {
    privates.pendingExecAbortController.abort(new AbortReason());
    privates.pendingExecAbortController = null;
  }

  return CancellablePromise.try<IComponentRouteExecReturn, TStrategy>((signal: IAdvancedAbortSignal) => {
    const abortController: IAdvancedAbortController = AdvancedAbortController.fromAbortSignals(signal);
    privates.pendingExecAbortController = abortController;

    const resolved = (): ICancellablePromise<IComponentRouteExecReturn, 'reject'> => {
      const rootNode: HTMLElement | null = (params.parentValue === void 0)
        ? null
        : params.parentValue.parentElement;

      return InjectComponentInRouter<'reject'>({
        rootNode,
        component: privates.component,
        routerId: privates.routerId,
        signal: abortController.signal,
        strategy: 'reject'
      })
        .then((element: HTMLElement | null) => {
          return {
            parentElement: element,
          };
        })
        .finally(() => {
          if (privates.pendingExecAbortController === abortController) {
            privates.pendingExecAbortController = null;
          }
        });
    };

    return privates.pendingExec = privates.pendingExec
      .then(resolved, resolved);
  }, params);
}

/** METHODS **/

/* GETTERS/SETTERS */

export function ComponentRouteGetComponent(instance: IComponentRoute): string {
  return (instance as IComponentRouteInternal)[COMPONENT_ROUTE_PRIVATE].component;
}

export function ComponentRouteGetRouterId(instance: IComponentRoute): string | null {
  return (instance as IComponentRouteInternal)[COMPONENT_ROUTE_PRIVATE].routerId;
}

/* METHODS */


/** CLASS **/

export class ComponentRoute extends Route<TComponentRouteExec> implements IComponentRoute {
  constructor(path: string, options: IComponentRouteOptions) {
    super(path, {
      ...options,
      exec: <TStrategy extends TAbortStrategy>(params: IComponentRouteExecParams<TStrategy>) => {
        return ComponentRouteExec<TStrategy>(this, params);
      },
      execMode: 'partial'
    });
    ConstructComponentRoute(this, path, options);
  }

  get component(): string {
    return ComponentRouteGetComponent(this);
  }

  get routerId(): string | null {
    return ComponentRouteGetRouterId(this);
  }
}

