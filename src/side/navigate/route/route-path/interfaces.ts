import { IRoutePathEntry, IRoutePathExecOptions } from './types';
import { TPathMatcherParams } from '../../path-matcher/types';
import { ICancellablePromise } from '@lifaon/observables';

/** INTERFACES */

export interface IRoutePathConstructor {
  new(routePath: Iterable<IRoutePathEntry>): IRoutePath;
}

export interface IRoutePath {
  readonly length: number;

  item(index: number): IRoutePathEntry;

  getParams(): TPathMatcherParams;

  exec<TExecReturn>(options?: IRoutePathExecOptions<any>): ICancellablePromise<TExecReturn>;

  toArray(): IRoutePathEntry[];

  [Symbol.iterator](): IterableIterator<IRoutePathEntry>;
}



