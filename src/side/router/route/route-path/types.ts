import { IRoute } from '../interfaces';
import { TPathMatcherParams } from '../../path-matcher/types';

/** TYPES */

export type IRoutePathEntry = {
  route: IRoute;
  params: TPathMatcherParams;
};
