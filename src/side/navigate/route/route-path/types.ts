import { IRoute } from '../interfaces';
import { TPathMatcherParams } from '../../path-matcher/types';
import { IAdvancedAbortSignal, TAbortStrategy } from '@lifaon/observables';
import { IRouteExecParams, TRouteExecGeneric } from '../types';

/** TYPES */

export type IRoutePathEntry = {
  route: IRoute<TRouteExecGeneric>;
  params: TPathMatcherParams;
};

export interface IRoutePathExecOptions<TExecValue> extends Partial<IRouteExecParams<TExecValue>> {
}
