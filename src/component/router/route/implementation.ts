import { IPathMatcher } from '../path-matcher/interfaces';
import { PathMatcher } from '../path-matcher/implementation';
import { htmlElementConstructorsToTagNamesMap } from '../../elements-list';
import { IRoute, IRouteKeyValueMap, IRouteOptions, TRouteContext } from './interfaces';
import { IReadonlyList, NotificationsObservable, ReadonlyList } from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';


export const ROUTE_PRIVATE = Symbol('route-private');

export interface IRoutePrivate {
  context: TRouteContext;
  pathMatcher: IPathMatcher;
  children: IReadonlyList<IRoute>;
  component: string | null;
  routerId: string | null;
  redirectTo: string | null;
}

export interface IRouteInternal extends IRoute {
  [ROUTE_PRIVATE]: IRoutePrivate;
}

export function ConstructRoute(route: IRoute, context: TRouteContext, options: IRouteOptions): void {
  ConstructClassWithPrivateMembers(route, ROUTE_PRIVATE);
  const privates: IRoutePrivate =  (route as IRouteInternal)[ROUTE_PRIVATE];
  privates.pathMatcher = new PathMatcher(String(options.path));

  if (options.children === void 0) {
    privates.children = new ReadonlyList<IRoute>([]);
  } else if (Symbol.iterator in options.children) {
    const children: IRoute[] = Array.from(options.children);
    for (let i  = 0, l = children.length; i < l; i++) {
      if (!(children[i] instanceof Route)) {
        throw new TypeError(`Expected Route at index #${i} or options.children`);
      }
    }
    privates.children = new ReadonlyList<IRoute>(children);
  } else {
    throw new TypeError(`Expected array as options.children`);
  }

  if ((options.component === void 0) || (options.component === null)) {
    privates.component = null;
  } else if (typeof options.component === 'string') {
    privates.component = options.component;
  } else if (htmlElementConstructorsToTagNamesMap.has(options.component)) {
    privates.component = htmlElementConstructorsToTagNamesMap.get(options.component)[Symbol.iterator]().next().value;
  } else {
    throw new TypeError(`Expected string, null or a constructor of HTMLElement as options.component.`);
  }

  if ((options.routerId === void 0) || (options.routerId === null) || (options.routerId === '')) {
    privates.routerId = null;
  } else if (typeof options.routerId === 'string') {
    privates.routerId = options.routerId;
  } else {
    throw new TypeError(`Expected string or null as options.routerId.`);
  }

  if ((options.redirectTo === void 0) || (options.redirectTo === null) || (options.redirectTo === '')) {
    privates.redirectTo = null;
  } else if (typeof options.redirectTo === 'string') {
    if (privates.component === null) {
      privates.redirectTo = options.redirectTo;
    } else {
      throw new Error(`Cannot have both options.redirectTo and options.component.`);
    }
  } else {
    throw new TypeError(`Expected string or null as options.redirectTo.`);
  }
}


export class Route extends NotificationsObservable<IRouteKeyValueMap> implements IRoute {
  constructor(options: IRouteOptions) {
    let context: TRouteContext = void 0;
    super((_context: TRouteContext) => {
      context = _context;
    });
    ConstructRoute(this, context, options);
  }

  get children(): IReadonlyList<IRoute> {
    return ((this as unknown) as IRouteInternal)[ROUTE_PRIVATE].children;
  }

  get pathMatcher(): IPathMatcher {
    return ((this as unknown) as IRouteInternal)[ROUTE_PRIVATE].pathMatcher;
  }

  get component(): string | null {
    return ((this as unknown) as IRouteInternal)[ROUTE_PRIVATE].component;
  }

  get routerId(): string | null {
    return ((this as unknown) as IRouteInternal)[ROUTE_PRIVATE].routerId;
  }

  get redirectTo(): string | null {
    return ((this as unknown) as IRouteInternal)[ROUTE_PRIVATE].redirectTo;
  }

}

