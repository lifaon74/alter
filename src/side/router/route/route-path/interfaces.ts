import { IRoute } from '../interfaces';
import { TPathMatcherParams } from '../../path-matcher/interfaces';

/** TYPES */

export type IRoutePathEntry = {
  route: IRoute;
  params: TPathMatcherParams;
};

/** INTERFACES */

export interface IRouteConstructor {
  new(routePath: Iterable<IRoutePathEntry>): IRoutePath;
}

export interface IRoutePath {
  readonly length: number;

  item(index: number): IRoutePathEntry;

  exec(): Promise<void>;

  toArray(): IRoutePathEntry[];

  [Symbol.iterator](): IterableIterator<IRoutePathEntry>;
}



