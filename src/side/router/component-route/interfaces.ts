import { IRoute, IRouteOptions } from '../route/interfaces';
import { HTMLElementConstructor } from '../../../core/custom-node/helpers/NodeHelpers';

/** TYPES */




export interface IComponentRouteOptions extends Pick<IRouteOptions, 'children'> {

}

/** INTERFACES */

export interface IComponentRouteConstructor {
  new(path: string, options?: IComponentRouteOptions): IComponentRoute;
}

export interface IComponentRoute extends IRoute {
  component?: string | HTMLElementConstructor;
  routerId?: string;
}



