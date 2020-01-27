/** PRIVATES **/
import { IComponentRoute, IComponentRouteOptions } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { Route } from '../route/implementation';
import { HTMLElementConstructor, IsHTMLElementConstructor } from '../../../core/custom-node/helpers/NodeHelpers';


export const COMPONENT_ROUTE_PRIVATE = Symbol('component-route-private');

export interface IComponentRoutePrivate {
  component: string | HTMLElementConstructor;
  routerId: string | null;
}

export interface IComponentRouteInternal extends IComponentRoute {
  [COMPONENT_ROUTE_PRIVATE]: IComponentRoutePrivate;
}

/** CONSTRUCTOR **/

export function ConstructComponentRoute(
  instance: IComponentRoute,
  path: string,
  options: IComponentRouteOptions,
): void {
  ConstructClassWithPrivateMembers(instance, COMPONENT_ROUTE_PRIVATE);
  const privates: IComponentRoutePrivate = (instance as IComponentRouteInternal)[COMPONENT_ROUTE_PRIVATE];
  if (
    (typeof options.component === 'string')
    || IsHTMLElementConstructor(typeof options.component)
  ) {
    privates.component = options.component;
  } else {
    throw new TypeError(`Expected string or HTMLElementConstructor as options.component`);
  }

  if (options.routerId === void 0) {
    privates.routerId = null;
  } else if (typeof options.routerId === 'string') {
    privates.routerId = options.routerId;
  } else {
    throw new TypeError(`Expected void or string as options.routerId`);
  }
}

export function IsComponentRoute(value: any): value is IComponentRoute {
  return IsObject(value)
    && value.hasOwnProperty(COMPONENT_ROUTE_PRIVATE as symbol);
}

/** METHODS **/

/* GETTERS/SETTERS */

/* METHODS */



/** CLASS **/

export class ComponentRoute extends Route implements IComponentRoute {
  constructor(path: string, options: IComponentRouteOptions) {
    super(path, options);
    ConstructComponentRoute(this, path, options);
  }

  readonly component: string | HTMLElementConstructor;
  readonly routerId: string | null;
}

