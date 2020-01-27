import { IPathMatcherResult } from './types';

/** INTERFACES **/

export interface IPathMatcherConstructor {
  new(path: string): IPathMatcher;
}

/**
 * Creates an URL's path pattern, and allows to test if a 'path' matches this pattern
 */
export interface IPathMatcher {
  readonly path: string;

  exec(path: string): IPathMatcherResult | null;
}

