import { IRoutePath } from './interfaces';
import { TPathMatcherParams } from '../../path-matcher/types';
import { IRoutePathEntry, IRoutePathExecOptions } from './types';
import { IRoutePathInternal, IRoutePathPrivate, ROUTE_PATH_PRIVATE } from './privates';
import { ConstructRoutePath } from './constructor';
import { MergeMaps } from '../../../../misc/helpers/map/merge';
import { CancellablePromise, ICancellablePromise } from '@lifaon/observables';


/** METHODS **/

/* GETTERS/SETTERS */

export function RoutePathGetLength(instance: IRoutePath): number {
  return (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE].routePath.length;
}


/* METHODS */

export function RoutePathItem(instance: IRoutePath, index: number): IRoutePathEntry {
  return (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE].routePath[index];
}

export function RoutePathGetParams(instance: IRoutePath): TPathMatcherParams {
  const privates: IRoutePathPrivate = (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE];
  const params: Map<string, string> = new Map<string, string>();
  for (let i = 0, l = privates.routePath.length; i < l; i++) {
    MergeMaps(params, privates.routePath[i].params as Map<string, string>);
  }
  return params;
}

export function RoutePathExec<TExecReturn>(instance: IRoutePath, options: IRoutePathExecOptions<any> = {}): ICancellablePromise<TExecReturn> {
  return CancellablePromise.try<TExecReturn>(async () => {
    const privates: IRoutePathPrivate = (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE];

    const params: Map<string, string> = new Map<string, string>(
      (options.params === void 0)
        ? []
        : options.params
    );

    let parentValue: TExecReturn = (options.params === void 0)
      ? void 0 as any
      : options.parentValue;

    for (let i = 0, l = privates.routePath.length; i < l; i++) {
      const entry: IRoutePathEntry = privates.routePath[i];
      MergeMaps(params, entry.params as Map<string, string>);

      if (entry.route.exec !== null) {
        let _params: TPathMatcherParams;
        switch (entry.route.execParamsMode) {
          case 'own':
            _params = entry.params;
            break;
          case 'parents':
            _params = params;
            break;
          default:
            throw new TypeError(`Unsupported execParamsMode '${ entry.route.execParamsMode }'`);
        }

        let shouldExec: boolean;

        switch (entry.route.execMode) {
          case 'partial':
            shouldExec = true;
            break;
          case 'final':
            shouldExec = (i === (l - 1));
            break;
          default:
            throw new TypeError(`Unsupported execMode '${ entry.route.execMode }'`);
        }

        if (shouldExec) {
          parentValue = await entry.route.exec.call(entry.route, {
            params: _params,
            parentValue
          });
        }
      }
    }
    return parentValue;
  }, options);
}

export function RoutePathToArray(instance: IRoutePath): IRoutePathEntry[] {
  return (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE].routePath.slice();
}

export function RoutePathToIterableIterator(instance: IRoutePath): IterableIterator<IRoutePathEntry> {
  return (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE].routePath[Symbol.iterator]();
}

/** CLASS **/

export class RoutePath implements IRoutePath {
  constructor(routePath: Iterable<IRoutePathEntry>) {
    ConstructRoutePath(this, routePath);
  }

  get length(): number {
    return RoutePathGetLength(this);
  }

  item(index: number): IRoutePathEntry {
    return RoutePathItem(this, index);
  }

  getParams(): TPathMatcherParams {
    return RoutePathGetParams(this);
  }

  exec<TExecReturn>(options?: IRoutePathExecOptions<any>): ICancellablePromise<TExecReturn> {
    return RoutePathExec<TExecReturn>(this, options);
  }


  toArray(): IRoutePathEntry[] {
    return RoutePathToArray(this);
  }

  [Symbol.iterator](): IterableIterator<IRoutePathEntry> {
    return RoutePathToIterableIterator(this);
  }
}

