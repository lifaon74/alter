import { IRoutePath, IRoutePathEntry } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { TPathMatcherParams } from '../../path-matcher/interfaces';


/** PRIVATES **/

export const ROUTE_PATH_PRIVATE = Symbol('route-path-private');

export interface IRoutePathPrivate {
  routePath: IRoutePathEntry[];
}

export interface IRoutePathInternal extends IRoutePath {
  [ROUTE_PATH_PRIVATE]: IRoutePathPrivate;
}

/** CONSTRUCTOR **/

export function ConstructRoutePath(
  instance: IRoutePath,
  routePath: Iterable<IRoutePathEntry>
): void {
  ConstructClassWithPrivateMembers(instance, ROUTE_PATH_PRIVATE);
  const privates: IRoutePathPrivate = (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE];
  privates.routePath = Array.from(routePath);
}

export function IsRoutePath(value: any): value is IRoutePath {
  return IsObject(value)
    && value.hasOwnProperty(ROUTE_PATH_PRIVATE as symbol);
}

/** METHODS **/

/* GETTERS/SETTERS */

export function RoutePathGetLength(instance: IRoutePath): number {
  return (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE].routePath.length;
}


/* METHODS */

export function RoutePathItem(instance: IRoutePath, index: number): IRoutePathEntry {
  return (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE].routePath[index];
}

export async function RoutePathExec(instance: IRoutePath): Promise<void> {
  const privates: IRoutePathPrivate = (instance as IRoutePathInternal)[ROUTE_PATH_PRIVATE];
  const params: Map<string, string> = new Map<string, string>();

  for (let i = 0, l = privates.routePath.length; i < l; i++) {
    const entry: IRoutePathEntry = privates.routePath[i];
    const iterator: Iterator<[string, string]> = entry.params.entries();
    let result: IteratorResult<[string, string]>;
    while (!(result = iterator.next()).done) {
      params.set(result.value[0], result.value[1]);
    }
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
        entry.route.exec.call(entry.route, _params);
      }
    }

  }
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


  exec(): Promise<void> {
    return RoutePathExec(this);
  }


  toArray(): IRoutePathEntry[] {
    return RoutePathToArray(this);
  }

  [Symbol.iterator](): IterableIterator<IRoutePathEntry> {
    return RoutePathToIterableIterator(this);
  }
}
