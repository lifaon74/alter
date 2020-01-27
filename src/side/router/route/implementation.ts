import { IPathMatcher } from '../path-matcher/interfaces';
import { IRoute } from './interfaces';
import { IReadonlyList } from '@lifaon/observables';
import { IRoutePath} from './route-path/interfaces';
import { RoutePath } from './route-path/implementation';
import { IPathMatcherResult } from '../path-matcher/types';
import { IRouteOptions, TRouteExec, TRouteExecMode, TRouteExecParamsMode } from './types';
import { IRouteInternal, IRoutePrivate, ROUTE_PRIVATE } from './privates';
import { ConstructRoute } from './constructor';
import { IRoutePathEntry } from './route-path/types';

/** METHODS **/

/* GETTERS/SETTERS */

export function RouteGetChildren(instance: IRoute): IReadonlyList<IRoute> {
  return (instance as IRouteInternal)[ROUTE_PRIVATE].children;
}

export function RouteGetPathMatcher(instance: IRoute): IPathMatcher {
  return (instance as IRouteInternal)[ROUTE_PRIVATE].pathMatcher;
}

export function RouteGetExec(instance: IRoute): TRouteExec | null {
  return (instance as IRouteInternal)[ROUTE_PRIVATE].exec;
}

export function RouteGetExecMode(instance: IRoute): TRouteExecMode | null {
  return (instance as IRouteInternal)[ROUTE_PRIVATE].execMode;
}

export function RouteGetExecParamsMode(instance: IRoute): TRouteExecParamsMode | null {
  return (instance as IRouteInternal)[ROUTE_PRIVATE].execParamsMode;
}



/* METHODS */

export async function RouteResolve(instance: IRoute, path: string): Promise<IRoutePath | null> {
  // may resolve only if:

  const privates: IRoutePrivate = (instance as IRouteInternal)[ROUTE_PRIVATE];
  const match: IPathMatcherResult | null = privates.pathMatcher.exec(path);
  if (match === null) { // path doesnt match
    return null;
  } else {  // path matches
    const entry: IRoutePathEntry = {
      route: instance,
      params: match.params
    };
    if (match.remaining === '') { // no remaining path
      if (
        (privates.exec !== null) // if exec is undefined, path is invalid
        && ( // if exec is defined, path is valid and we must check privates.resolve
          (privates.resolve === null)
          || await privates.resolve.call(instance, match)
        )
      ) {
        return new RoutePath([entry]);
      } else {
        return null;
      }
    } else { // some remaining path
      if (
        (privates.resolve === null)
        || await privates.resolve.call(instance, match)
      ) {
        // at least one child must resolve
        for (let i = 0, l = privates.children.length; i < l; i++) {
          const routePath: IRoutePath | null = await privates.children.item(i).resolve(match.remaining);
          if (routePath !== null) {
            return new RoutePath([entry, ...routePath.toArray()]);
          }
        }
        return null;
      } else {
        return null;
      }
    }
  }
}

/** CLASS **/

export class Route implements IRoute {
  constructor(path: string, options?: IRouteOptions) {
    ConstructRoute(this, path, options);
  }

  get children(): IReadonlyList<IRoute> {
    return RouteGetChildren(this);
  }

  get pathMatcher(): IPathMatcher {
    return RouteGetPathMatcher(this);
  }

  get exec(): TRouteExec | null {
    return RouteGetExec(this);
  }

  get execMode(): TRouteExecMode | null {
    return RouteGetExecMode(this);
  }

  get execParamsMode(): TRouteExecParamsMode | null {
    return RouteGetExecParamsMode(this);
  }


  resolve(path: string): Promise<IRoutePath | null> {
    return RouteResolve(this, path);
  }
}

