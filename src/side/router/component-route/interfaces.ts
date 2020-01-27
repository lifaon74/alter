import { IRoute} from '../route/interfaces';
import { HTMLElementConstructor } from '../../../core/custom-node/helpers/NodeHelpers';
import { IRouteOptions } from '../route/types';

/** TYPES */




export interface IComponentRouteOptions extends Pick<IRouteOptions, 'children'> {
  component: string | HTMLElementConstructor;
  routerId?: string;
}

/** INTERFACES */

export interface IComponentRouteConstructor {
  new(path: string, options?: IComponentRouteOptions): IComponentRoute;
}

export interface IComponentRoute extends IRoute {
  readonly component: string | HTMLElementConstructor;
  readonly routerId: string | null;
}



