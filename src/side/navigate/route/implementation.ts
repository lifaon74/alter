import { IPathMatcher } from '../path-matcher/interfaces';
import { IRoute } from './interfaces';
import { IReadonlyList } from '@lifaon/observables';
import { IRoutePath} from './route-path/interfaces';
import { RoutePath } from './route-path/implementation';
import { IPathMatcherResult } from '../path-matcher/types';
import { IRouteOptions, InferChildRoute, TRouteExecGeneric, TRouteExecMode, TRouteExecParamsMode } from './types';
import { IRouteInternal, IRoutePrivate, ROUTE_PRIVATE } from './privates';
import { ConstructRoute } from './constructor';
import { IRoutePathEntry } from './route-path/types';

/** METHODS **/

/* GETTERS/SETTERS */

export function RouteGetChildren<TExec extends TRouteExecGeneric>(instance: IRoute<TExec>): IReadonlyList<InferChildRoute<TExec>> {
  return (instance as IRouteInternal<TExec>)[ROUTE_PRIVATE].children;
}

export function RouteGetPathMatcher<TExec extends TRouteExecGeneric>(instance: IRoute<TExec>): IPathMatcher {
  return (instance as IRouteInternal<TExec>)[ROUTE_PRIVATE].pathMatcher;
}

export function RouteGetExec<TExec extends TRouteExecGeneric>(instance: IRoute<TExec>): TExec | null {
  return (instance as IRouteInternal<TExec>)[ROUTE_PRIVATE].exec;
}

export function RouteGetExecMode<TExec extends TRouteExecGeneric>(instance: IRoute<TExec>): TRouteExecMode | null {
  return (instance as IRouteInternal<TExec>)[ROUTE_PRIVATE].execMode;
}

export function RouteGetExecParamsMode<TExec extends TRouteExecGeneric>(instance: IRoute<TExec>): TRouteExecParamsMode | null {
  return (instance as IRouteInternal<TExec>)[ROUTE_PRIVATE].execParamsMode;
}

/* METHODS */

export async function RouteResolve<TExec extends TRouteExecGeneric>(instance: IRoute<TExec>, path: string): Promise<IRoutePath | null> {
  // may resolve only if:

  const privates: IRoutePrivate<TExec> = (instance as IRouteInternal<TExec>)[ROUTE_PRIVATE];
  const match: IPathMatcherResult | null = privates.pathMatcher.exec(path);
  if (match === null) { // path doesnt match
    return null;
  } else {  // path matches
    //  we must check that privates.resolve() passes
    if (
      (privates.resolve === null)
      || await privates.resolve.call(instance, match)
    ) {
      const entry: IRoutePathEntry = {
        route: instance,
        params: match.params
      };

      // at least one child must resolve
      for (let i = 0, l = privates.children.length; i < l; i++) {
        const routePath: IRoutePath | null = await privates.children.item(i).resolve(match.remaining);
        if (routePath !== null) {
          return new RoutePath([entry, ...routePath.toArray()]);
        }
      }

      // except if no remaining path and exec is defined
      if (
        (match.remaining === '') // no remaining path
        && (privates.exec !== null) // if exec is undefined, path is invalid
      ) {
        return new RoutePath([entry]);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

// export async function RouteResolve(instance: IRoute, path: string): Promise<IRoutePath | null> {
//   // may resolve only if:
//
//   const privates: IRoutePrivate = (instance as IRouteInternal)[ROUTE_PRIVATE];
//   const match: IPathMatcherResult | null = privates.pathMatcher.exec(path);
//   if (match === null) { // path doesnt match
//     return null;
//   } else {  // path matches
//     const entry: IRoutePathEntry = {
//       route: instance,
//       params: match.params
//     };
//     if (match.remaining === '') { // no remaining path
//       if (
//         (privates.exec !== null) // if exec is undefined, path is invalid
//         && ( // if exec is defined, path is valid and we must check privates.resolve
//           (privates.resolve === null)
//           || await privates.resolve.call(instance, match)
//         )
//       ) {
//         return new RoutePath([entry]);
//       } else {
//         return null;
//       }
//     } else { // some remaining path
//       if (
//         (privates.resolve === null)
//         || await privates.resolve.call(instance, match)
//       ) {
//         // at least one child must resolve
//         for (let i = 0, l = privates.children.length; i < l; i++) {
//           const routePath: IRoutePath | null = await privates.children.item(i).resolve(match.remaining);
//           if (routePath !== null) {
//             return new RoutePath([entry, ...routePath.toArray()]);
//           }
//         }
//         return null;
//       } else {
//         return null;
//       }
//     }
//   }
// }

/** CLASS **/

export class Route<TExec extends TRouteExecGeneric> implements IRoute<TExec> {
  constructor(path: string, options?: IRouteOptions<TExec>) {
    ConstructRoute<TExec>(this, path, options);
  }

  get children(): IReadonlyList<InferChildRoute<TExec>> {
    return RouteGetChildren(this);
  }

  get pathMatcher(): IPathMatcher {
    return RouteGetPathMatcher<TExec>(this);
  }

  get exec(): TExec | null {
    return RouteGetExec<TExec>(this);
  }

  get execMode(): TRouteExecMode | null {
    return RouteGetExecMode<TExec>(this);
  }

  get execParamsMode(): TRouteExecParamsMode | null {
    return RouteGetExecParamsMode<TExec>(this);
  }


  resolve(path: string): Promise<IRoutePath | null> {
    return RouteResolve<TExec>(this, path);
  }
}

