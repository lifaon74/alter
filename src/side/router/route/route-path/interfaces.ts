import { IRoutePathEntry } from './types';

/** INTERFACES */

export interface IRoutePathConstructor {
  new(routePath: Iterable<IRoutePathEntry>): IRoutePath;
}

export interface IRoutePath {
  readonly length: number;

  item(index: number): IRoutePathEntry;

  exec(): Promise<void>;

  toArray(): IRoutePathEntry[];

  [Symbol.iterator](): IterableIterator<IRoutePathEntry>;
}



