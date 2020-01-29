import { IRouter, IRouterNavigateOptions, IRouterOptions } from './interfaces';
import { IComponentRoute } from '../component-route/interfaces';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { navigation } from '../navigation/implementation';
import { INavigation } from '../navigation/interfaces';
import { GetURL } from '../navigation/url-helpers';
import { IRoutePath } from '../route/route-path/interfaces';
import { IsComponentRoute } from '../component-route/constructor';

/** PRIVATES **/

export interface IPendingNavigation {
  url: string;
  resolve: () => void;
  reject: (reason: any) => void;
  abort: (reason: any) => void;
}

export const ROUTER_PRIVATE = Symbol('router-private');

export interface IRouterPrivate {
  route: IComponentRoute;
  pendingNavigation: Promise<void>;
  pendingNavigations: IPendingNavigation[];
  destroy(): void;
}

export interface IRouterPrivatesInternal {
  [ROUTER_PRIVATE]: IRouterPrivate;
}

export interface IRouterInternal extends IRouterPrivatesInternal, IRouter {
}


let ROUTER_DEFINED: boolean = false;

/** CONSTRUCTOR **/

export function ConstructRouter(
  instance: IRouter,
  options: IRouterOptions
): void {
  if (ROUTER_DEFINED) {
    throw new Error(`Only one instance of Router may be created`);
  } else {
    ROUTER_DEFINED = true;
  }

  ConstructClassWithPrivateMembers(instance, ROUTER_PRIVATE);
  const privates: IRouterPrivate = (instance as IRouterInternal)[ROUTER_PRIVATE];

  if (IsObject(options)) {
    if (IsComponentRoute(options.route)) {
      if (options.route.pathMatcher.path === '/') {
        // INFO maybe search recursively all children where path is '/' until '/**' is reached
        if (!options.route.children.some(child => (child.pathMatcher.path === '/**'))) {
          throw new Error(`A default route '**' should exists as a children of the master's route '/'`);
        }
      } else if (options.route.pathMatcher.path !== '/**') {
        throw new Error(`The master route's path should be '/' or '**'`);
      }

      privates.route = options.route;
    } else {
      throw new TypeError(`Expected ComponentRoute as options.route`);
    }


    privates.pendingNavigation = Promise.resolve();
    privates.pendingNavigations = [];

    const navigateObserver = navigation.addListener('navigate', () => {
      RouterOnNavigate(instance);
    }).activate();

    privates.destroy = () => {
      navigateObserver.deactivate();
    };
  } else {
    throw new TypeError(`Expected object as options`);
  }
}

export function IsRouter(value: any): value is IRouter {
  return IsObject(value)
    && value.hasOwnProperty(ROUTER_PRIVATE as symbol);
}

/** FUNCTIONS **/



export function RouterOnNavigate(instance: IRouter): void {
  console.log('RouterOnNavigate');
  const privates: IRouterPrivate = (instance as IRouterInternal)[ROUTER_PRIVATE];

  const url: URL = new URL(window.location.href);
  // TODO
  privates.route.resolve(url.pathname)
    .then((routePath: IRoutePath | null) => {
      if (routePath === null) {
        throw new Error(`No route matching the url '${ url.href }'`);
      } else {
        return routePath.exec();
      }
    });
}

/** METHODS **/

/* GETTERS/SETTERS */

export function RouterGetRoute(instance: IRouter): IComponentRoute {
  return (instance as IRouterInternal)[ROUTER_PRIVATE].route;
}

export function RouterGetNavigation(): INavigation {
  return navigation;
}


/* METHODS */

export function RouterNavigate(instance: IRouter, url: string | URL, options?: IRouterNavigateOptions): Promise<void> {
  return new Promise((resolve: () => void, reject: (reason: any) => void) => {
    (instance as IRouterInternal)[ROUTER_PRIVATE].pendingNavigations.push({
      url: GetURL(url).href,
      resolve,
      reject,
      abort: (reason: any) => {
        reject(reason);
      }
    });
    navigation.navigate(url, options).catch(reject);
  });
}


/** CLASS **/

export class Router implements IRouter {

  static create(options: IRouterOptions): IRouter {
    return new Router(options);
  }

  protected constructor(options: IRouterOptions) {
    ConstructRouter(this, options);
  }

  get route(): IComponentRoute {
    return RouterGetRoute(this);
  }

  get navigation(): INavigation {
    return RouterGetNavigation();
  }

  navigate(url: string | URL, options?: IRouterNavigateOptions): Promise<void> {
    return RouterNavigate(this, url, options);
  }
}








