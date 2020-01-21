import { IPathMatcher, IPathMatcherResult } from '../path-matcher/interfaces';
import { PathMatcher } from '../path-matcher/implementation';
import { IRoute, IRouteOptions, TRouteExec, TRouteExecMode, TRouteExecParamsMode, TRouteResolve } from './interfaces';
import { IReadonlyList, ReadonlyList } from '@lifaon/observables';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '@lifaon/observables/src/helpers';
import { IRoutePath, IRoutePathEntry } from './route-path/interfaces';
import { RoutePath } from './route-path/implementation';

/** PRIVATES **/

export const ROUTE_PRIVATE = Symbol('route-private');

export interface IRoutePrivate {
  pathMatcher: IPathMatcher;
  children: IReadonlyList<IRoute>;
  resolve: TRouteResolve | null;
  exec: TRouteExec | null;
  execMode: TRouteExecMode | null;
  execParamsMode: TRouteExecParamsMode | null;
}

export interface IRouteInternal extends IRoute {
  [ROUTE_PRIVATE]: IRoutePrivate;
}

/** CONSTRUCTOR **/

export function ConstructRoute(
  instance: IRoute,
  path: string,
  options: IRouteOptions = {},
): void {
  ConstructClassWithPrivateMembers(instance, ROUTE_PRIVATE);
  const privates: IRoutePrivate = (instance as IRouteInternal)[ROUTE_PRIVATE];

  if (IsObject(options)) {
    if (typeof path === 'string') {
      privates.pathMatcher = new PathMatcher(path);
    } else {
      throw new TypeError(`Expected string as path`);
    }

    if (options.children === void 0) {
      privates.children = new ReadonlyList<IRoute>([]);
    } else if (Symbol.iterator in options.children) {
      const children: IRoute[] = Array.from(options.children);
      for (let i = 0, l = children.length; i < l; i++) {
        if (!IsRoute(children[i])) {
          throw new TypeError(`Expected Route at index #${ i } of options.children`);
        }
      }
      privates.children = new ReadonlyList<IRoute>(children);
    } else {
      throw new TypeError(`Expected array as options.children`);
    }

    if (options.resolve === void 0) {
      privates.resolve = null;
    } else if (typeof options.resolve === 'function') {
      privates.resolve = options.resolve;
    } else {
      throw new TypeError(`Expected void or function as options.resolve`);
    }

    if (options.exec === void 0) {
      privates.exec = null;
    } else if (typeof options.exec === 'function') {
      privates.exec = options.exec;
    } else {
      throw new TypeError(`Expected void or function as options.exec`);
    }

    if (options.execMode === void 0) {
      privates.execMode = (privates.exec === null) ? null : 'final';
    } else if (privates.exec === null) {
      throw new TypeError(`Expected void as options.execMode if options.exec is undefined`);
    } else if (['partial', 'final'].includes(options.execMode)) {
      privates.execMode = options.execMode;
    } else {
      throw new TypeError(`Expected void, 'partial' or 'final' as options.execMode`);
    }

    if (options.execParamsMode === void 0) {
      privates.execParamsMode = (privates.exec === null) ? null : 'parents';
    } else if (privates.exec === null) {
      throw new TypeError(`Expected void as options.execParamsMode if options.exec is undefined`);
    } else if (['own', 'parents'].includes(options.execParamsMode)) {
      privates.execParamsMode = options.execParamsMode;
    } else {
      throw new TypeError(`Expected void, 'own' or 'parents' as options.execParamsMode`);
    }
  } else {
    throw new TypeError(`Expected void or object as options`);
  }
}

export function IsRoute(value: any): value is IRoute {
  return IsObject(value)
    && value.hasOwnProperty(ROUTE_PRIVATE as symbol);
}

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

