import { IPathMatcher } from './interfaces';
import { IPathMatcherResult } from './types';
import { NormalizeURLPath } from './functions';
import { IPathMatcherInternal, IPathMatcherPrivate, PATH_MATCHER_PRIVATE } from './privates';
import { ConstructPathMatcher } from './constructor';

/** METHODS **/

/* GETTERS/SETTERS */

export function PathMatcherGetPath(instance: IPathMatcher): string {
  return (instance as IPathMatcherInternal)[PATH_MATCHER_PRIVATE].path;
}

/* METHODS */

export function PathMatcherExec(instance: IPathMatcher, path: string): IPathMatcherResult | null {
  const privates: IPathMatcherPrivate = (instance as IPathMatcherInternal)[PATH_MATCHER_PRIVATE];
  path = NormalizeURLPath(path);

  const match: RegExpExecArray | null = privates.regExp.exec(path);
  if (match === null) {
    return null;
  } else {
    // new Map<string, string>(
    //   privates.params.map((param: string, index: number) => {
    //     return [param, match[index + 1]];
    //   })
    // )
    const params: Map<string, string> = new Map<string, string>();
    for (let i = 0, l = match.length - 1; i < l; i++) {
      params.set(privates.params[i], match[i + 1]);
    }
    return Object.freeze({
      params,
      remaining: path.substring(match[0].length),
    });
  }
}


/** CLASS **/

export class PathMatcher implements IPathMatcher {
  constructor(path: string) {
    ConstructPathMatcher(this, path);
  }

  get path(): string {
    return PathMatcherGetPath(this);
  }

  exec(path: string): IPathMatcherResult | null {
    return PathMatcherExec(this, path);
  }
}
