import { IRoutePath } from './interfaces';
import { IRoutePathEntry } from './types';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { IRoutePathInternal, IRoutePathPrivate, ROUTE_PATH_PRIVATE } from './privates';
import { IsObject } from '../../../../misc/helpers/is/IsObject';

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
