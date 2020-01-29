import { IPathMatcher } from './interfaces';

/** PRIVATES **/

export const PATH_MATCHER_PRIVATE = Symbol('path-matcher-private');

export interface IPathMatcherPrivate {
  path: string;
  regExp: RegExp;
  params: string[];
}

export interface IPathMatcherPrivatesInternal {
  [PATH_MATCHER_PRIVATE]: IPathMatcherPrivate;
}

export interface IPathMatcherInternal extends IPathMatcherPrivatesInternal, IPathMatcher {
}
