import { IPathMatcherResult } from './path-matcher/interfaces';
import { AttachNode, DestroyChildNodes } from '../../custom-node/node-state-observable/mutations';
import { navigation, NavigationNavigate } from './navigation/implementation';
import { IRoute} from './route/interfaces';
import { IRoutePathEntry, IRouter, IRouterNavigateOptions, IRouterRoutePathParams, TRoutePath } from './interfaces';
import { IPromiseCancelToken, IReadonlyList, PromiseCancelToken, ReadonlyList, Reason } from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../misc/helpers/ClassWithPrivateMembers';


// export interface Route {
//   path?: string;
//   pathMatch?: string;
//   matcher?: UrlMatcher;
//   component?: Type<any>;
//   redirectTo?: string;
//   outlet?: string;
//   canActivate?: any[];
//   canActivateChild?: any[];
//   canDeactivate?: any[];
//   canLoad?: any[];
//   data?: Data;
//   resolve?: ResolveData;
//   children?: Routes;
//   loadChildren?: LoadChildren;
//   runGuardsAndResolvers?: RunGuardsAndResolvers;
// }


export const ROUTER_PRIVATE = Symbol('router-private');

export interface IRouterPrivate {
  routes: IRoute[];
  readonlyRoutes: IReadonlyList<IRoute>;
  navigatePromise: Promise<void>;
  navigateCancelToken: IPromiseCancelToken | null;
  navigations: [string, () => void, (reason: any) => void][];
}

export interface IRouterInternal extends IRouter {
  [ROUTER_PRIVATE]: IRouterPrivate;
}

let constructed: boolean = false;
export function ConstructRouter(router: IRouter, routes: Iterable<IRoute>): void {
  if (constructed) {
    throw new Error(`Only one router may be created.`);
  } else {
    constructed = true;

    ConstructClassWithPrivateMembers(router, ROUTER_PRIVATE);
    (router as IRouterInternal)[ROUTER_PRIVATE].routes = Array.from(routes);
    (router as IRouterInternal)[ROUTER_PRIVATE].readonlyRoutes = new ReadonlyList<IRoute>((router as IRouterInternal)[ROUTER_PRIVATE].routes);
    (router as IRouterInternal)[ROUTER_PRIVATE].navigatePromise = Promise.resolve();
    (router as IRouterInternal)[ROUTER_PRIVATE].navigateCancelToken = null;
    (router as IRouterInternal)[ROUTER_PRIVATE].navigations = [];

    navigation.addListener('navigate', () => {
      RouterOnNavigate(router);
    }).activate();
  }
}


export function RouterOnNavigate(router: IRouter): void {
  const privates: IRouterPrivate = (router as IRouterInternal)[ROUTER_PRIVATE];
  // const navigationPrivates: INavigationPrivate<TRouterEvents, never> = (router as IRouterInternal)[NAVIGATION_PRIVATE];

  const url: URL = new URL(window.location.href);

  RouterApplyNavigate(router, url)
    .then(() => {
      while(privates.navigations.length > 0) {
        const [_url, resolve, reject] = privates.navigations.shift();
        if (_url === url.href) {
          resolve();
          break;
        } else {
          reject(new Reason<string>(`Navigate before last one finished`, 'CANCEL'));
        }
      }
    }, (error: any) => {
      while(privates.navigations.length > 0) {
        const [_url,, reject] = privates.navigations.shift();
        reject(error);
        if (_url === url.href) {
          return;
        }
      }
      console.warn('[ROUTER ERROR]', error);
    });
}

export function RouterApplyNavigate(router: IRouter, url: URL): Promise<void> {
  const privates: IRouterPrivate = (router as IRouterInternal)[ROUTER_PRIVATE];

  const token: IPromiseCancelToken = new PromiseCancelToken();
  if (privates.navigateCancelToken !== null) {
    privates.navigateCancelToken.cancel(new Reason<string>(`Navigate before last one finished`, 'CANCEL'));
  }
  privates.navigateCancelToken = token;

  return privates.navigatePromise = privates.navigatePromise
    .catch(() => {})
    .then(() => {
      if (token.cancelled) {
        throw token.reason;
      } else {
        const routePath: TRoutePath = RouterGetRoutePath(router, url);
        if (routePath.length === 0) {
          throw new Error(`No route matching the url '${url.href}'`);
        } else {
          return ResolveRoutePath(routePath, token);
        }
      }
    })
    .finally(() => {
      if (privates.navigateCancelToken === token) {
        privates.navigateCancelToken = null;
      }
    });
}

// export function RouterOnNavigate1(router: IRouter): void {
//   console.log('navigate');
//
//   const routerPrivates: IRouterPrivate = (router as IRouterInternal)[ROUTER_PRIVATE];
//   const navigationPrivates: INavigationPrivate<TRouterEvents, never> = (router as IRouterInternal)[NAVIGATION_PRIVATE];
//
//   const url: URL = new URL(window.location.href);
//
//   // 1) get associated navigation
//   let navigation: [any, any, IPromiseCancelToken] | null;
//   if (routerPrivates.navigations.has(url.href)) {
//     navigation = routerPrivates.navigations.get(url.href);
//     routerPrivates.navigations.delete(url.href);
//   } else {
//     navigation = null;
//   }
//
//   const cancelReason: IReason<string> = new Reason<string>(`Navigate before last one finished`, 'CANCEL');
//
//   // 2) cancel all others navigations
//   for (const [,reject] of routerPrivates.navigations.values()) {
//     reject(cancelReason);
//   }
//
//
//   const token: IPromiseCancelToken = new PromiseCancelToken();
//   if (routerPrivates.navigateCancelToken !== null) {
//     routerPrivates.navigateCancelToken.cancel(new Reason<string>(`Navigate before last one finished`, 'CANCEL'));
//   }
//   routerPrivates.navigateCancelToken = token;
//
//
//   routerPrivates.navigatePromise = routerPrivates.navigatePromise
//     .then(() => {
//       if (token.cancelled) {
//         throw token.reason;
//       } else {
//         const routePath: TRoutePath = RouterGetRoutePath(router, url);
//         if (routePath.length === 0) {
//           throw new Error(`No route matching the url '${url.href}'`);
//         } else {
//           return ResolveRoutePath(routePath, token);
//         }
//       }
//     })
//     .then(() => {
//       if (routerPrivates.navigations.has(url.href)) {
//         const [resolve] = routerPrivates.navigations.get(url.href);
//       }
//       navigationPrivates.context.dispatch('router-complete');
//     }, (reason: any) => {
//       if ((reason instanceof Reason) && (reason.code === 'CANCEL')) {
//         // navigationPrivates.context.dispatch('router-cancel');
//       } else {
//         navigationPrivates.context.dispatch('router-error');
//         console.warn('[ROUTER ERROR]', reason);
//       }
//
//       // if (!(reason instanceof Reason) || (reason.code !== 'CANCEL')) {
//       //   (router as IRouterInternal)[NAVIGATION_PRIVATE].context.dispatch('router-error');
//       // }
//     })
//     .finally(() => {
//       if (routerPrivates.navigateCancelToken === token) {
//         routerPrivates.navigateCancelToken = null;
//       }
//     });
// }

export function RouterNavigate(router: IRouter, url: string | URL, options: IRouterNavigateOptions = {}): Promise<void> {
  return new Promise((resolve: () => void, reject: (reason: any) => void) => {
    (router as IRouterInternal)[ROUTER_PRIVATE].navigations.push([GetURL(url).href, resolve, reject]);
    NavigationNavigate(url, options).catch(reject);
  });
}

// export function RouterNavigate(router: IRouter, url: string | URL, options: IRouterNavigateOptions = {}, ): Promise<void> {
//   const privates: IRouterPrivate = (router as IRouterInternal)[ROUTER_PRIVATE];
//
//   const token: IPromiseCancelToken = new PromiseCancelToken();
//   if (privates.navigateCancelToken !== null) {
//     privates.navigateCancelToken.cancel(new Reason<string>(`Navigate before last one finished`, 'CANCEL'));
//   }
//   privates.navigateCancelToken = token;
//
//   return privates.navigatePromise = privates.navigatePromise
//     .then(() => {
//       return NavigationNavigate(url, options)
//         .then(() => {
//           if (token.cancelled) {
//             throw token.reason;
//           } else {
//             url = GetURL(url);
//             const routePath: TRoutePath = RouterGetRoutePath(router, url);
//             if (routePath.length === 0) {
//               throw new Error(`No route matching the url '${url.href}'`);
//             } else {
//               return ResolveRoutePath(routePath, token);
//             }
//           }
//         })
//         .catch((reason: any) => {
//           if (!(reason instanceof Reason) || (reason.code !== 'CANCEL')) {
//             throw reason;
//           }
//         })
//         .finally(() => {
//           if (privates.navigateCancelToken === token) {
//             privates.navigateCancelToken = null;
//           }
//         });
//     });
// }

export function RouterGetRoutePath(router: IRouter, url: string | URL = new URL(window.location.href)): TRoutePath {
  return ResolveRoutes(GetURL(url).pathname, (router as IRouterInternal)[ROUTER_PRIVATE].routes);
}

export function RouterGetParams(router: IRouter, url: string | URL = new URL(window.location.href)): IRouterRoutePathParams {
  const allParams: IRouterRoutePathParams = {};
  const routePath: TRoutePath = RouterGetRoutePath(router, url);
  for (const { params } of routePath) {
    Object.assign(allParams, params);
  }
  return allParams;
}

export function GetURL(url: string | URL): URL {
  if (typeof url === 'string') {
    return new URL(url, window.location.origin);
  } else if (url instanceof URL) {
    return url;
  } else {
    throw new TypeError(`Expected string or URL as url`);
  }
}


/**
 * Find first matching router Element
 * @param rootNode
 * @param token
 * @param id
 * @param timeout
 */
export function FindRouterElement(rootNode: NodeSelector, token: IPromiseCancelToken, id: string | null = null, timeout: number = 5000): Promise<HTMLElement> {
  return new Promise((resolve: any, reject: any) => {
    const endDate: number = Date.now() + timeout;
    const loop = () => {
      if (token.cancelled) {
        reject(token.reason);
      } else {
        if (Date.now() < endDate) {
          const router: HTMLElement | null = (id === null)
            ? rootNode.querySelector('router')
            : document.getElementById(id);
          if (router === null) {
            setTimeout(loop, 50);
          } else {
            resolve(router);
          }
        } else{
          reject(new Error(`Cannot find any <router/>`));
        }
      }
    };

    loop();
  });
}

/**
 * Resolves path of routes for a specific path.
 * Returns empty array if no matches
 * @param path
 * @param routes
 */
export function ResolveRoutes(path: string, routes: Iterable<IRoute>): TRoutePath {
  for (const route of routes) {
    const match: IPathMatcherResult | null = route.pathMatcher.exec(path);
    if (match !== null) {
      const entry: IRoutePathEntry = {
        route: route,
        params:  match.params
      };
      if (match.remaining === '') {
        return [entry];
      } else {
        const routePath: TRoutePath | null = ResolveRoutes(match.remaining, route.children);
        if (routePath.length > 0) {
          routePath.unshift(entry);
          return routePath;
        }
      }
    }
  }
  return [];
}


/**
 * Injects proper components into <router/> following routePath.
 * @param routePath
 * @param token
 * @param rootNode
 */
export function ResolveRoutePath(
  routePath: TRoutePath,
  token: IPromiseCancelToken = new PromiseCancelToken(),
  rootNode: NodeSelector = document
): Promise<void> {
  return new Promise<void>((resolve: any, reject: any) => {
    if (token.cancelled) {
      reject(token.reason);
    } else if (routePath.length === 0) {
      const router: HTMLElement | null = rootNode.querySelector('router');
      if (router !== null) {
        DestroyChildNodes(router);
      }
      resolve();
    } else {
      const { route } = routePath[0];
      resolve(
        FindRouterElement(rootNode, token, route.routerId)
          .then((router: HTMLElement) => {
            if (token.cancelled) {
              throw token.reason;
            } else {
              const node: HTMLElement = document.createElement(route.component);
              DestroyChildNodes(router);
              AttachNode(node, router);
              return ResolveRoutePath(routePath.slice(1), token, node);
            }
          })
      );
    }
  });
}



export class Router implements IRouter {

  constructor(routes: Iterable<IRoute>) {
    ConstructRouter(this, routes);
  }

  get routes(): IReadonlyList<IRoute> {
    return ((this as unknown) as IRouterInternal)[ROUTER_PRIVATE].readonlyRoutes;
  }

  getParams(): IRouterRoutePathParams {
    return RouterGetParams(this);
  }

  navigate(url: string | URL, options?: IRouterNavigateOptions): Promise<void> {
    return RouterNavigate(this, url, options);
  }

  getRoutePath(url?: string | URL): TRoutePath {
    return RouterGetRoutePath(this, url);
  }

}

