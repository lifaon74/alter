import { IPathMatcher, IPathMatcherResult } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';

/** FUNCTIONS **/
/**
 * INFO: new Path() is not used because the /:id pattern is an invalid path
 */
export function NormalizeURLPath(path: string): string {
  const url: URL = new URL('http://localhost');
  url.pathname = path;
  return url.pathname;
}

export function RegExpEscape(pattern: string): string {
  return pattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export interface IParsedURLPath {
  regExp: RegExp;
  params: string[];
}

/**
 * INFO: path must be normalized
 */
export function ParseURLPath(path: string): IParsedURLPath {
  // path.replace(/(^|\/):([^/]+)/g, '$1(?<$2>[^/]+)');
  const params: string[] = [];
  const pattern: string = RegExpEscape(path) // escape special chars
    .replace(/\\\*\\\*$/g, '(?:.*?)$') // wildcard
    .replace(/(^|\/):([^/]+)/g, (substring: string, ...args: any[]) => {
      if (params.includes(args[1])) {
        throw new Error(`Found a path having identical param's names '${args[1]}'`);
      } else {
        params.push(args[1]);
      }
      return args[0] + '([^/]+)';
    });

  return {
    regExp: new RegExp(`^${pattern}`, ''),
    params
  };
}


/*----------------------------------------------------------------------------------------------------*/

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

/** CONSTRUCTOR **/

export function ConstructPathMatcher(
  instance: IPathMatcher,
  path: string
): void {
  ConstructClassWithPrivateMembers(instance, PATH_MATCHER_PRIVATE);
  const privates: IPathMatcherPrivate = (instance as IPathMatcherInternal)[PATH_MATCHER_PRIVATE];
  privates.path = NormalizeURLPath(path);
  const parsedPath: IParsedURLPath = ParseURLPath(privates.path);
  privates.regExp = parsedPath.regExp;
  privates.params = parsedPath.params;
}

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
