import { IRoutePathEntry, IRoutePathExecOptions } from './types';
import { TPathMatcherParams } from '../../path-matcher/types';
import { ICancellablePromise } from '@lifaon/observables';
import { TAbortStrategy } from '@lifaon/observables/src/misc/advanced-abort-controller/advanced-abort-signal/types';

/** INTERFACES */

export interface IRoutePathConstructor {
  new(routePath: Iterable<IRoutePathEntry>): IRoutePath;
}

export interface IRoutePath {
  readonly length: number;

  item(index: number): IRoutePathEntry;

  getParams(): TPathMatcherParams;

  exec<TExecReturn, TStrategy extends TAbortStrategy>(options?: IRoutePathExecOptions<any, TStrategy>): ICancellablePromise<TExecReturn, TStrategy>;

  toArray(): IRoutePathEntry[];

  [Symbol.iterator](): IterableIterator<IRoutePathEntry>;
}



