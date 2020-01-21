/** PRIVATES **/
import { IComponentRoute, IComponentRouteOptions } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { Route } from '../route/implementation';


export const COMPONENT_ROUTE_PRIVATE = Symbol('component-route-private');

export interface IComponentRoutePrivate {

}

export interface IComponentRouteInternal extends IComponentRoute {
  [COMPONENT_ROUTE_PRIVATE]: IComponentRoutePrivate;
}

/** CONSTRUCTOR **/

export function ConstructComponentRoute(
  instance: IComponentRoute,
  path: string,
  options: IComponentRouteOptions = {},
): void {
  ConstructClassWithPrivateMembers(instance, COMPONENT_ROUTE_PRIVATE);
  const privates: IComponentRoutePrivate = (instance as IComponentRouteInternal)[COMPONENT_ROUTE_PRIVATE];

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
  constructor(path: string, options?: IComponentRouteOptions) {
    super(path, options);
    ConstructComponentRoute(this, path, options);
  }
}

