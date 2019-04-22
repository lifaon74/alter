import { IPathMatcher, IPathMatcherResult } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../misc/helpers/ClassWithPrivateMembers';


export function NormalizeURLPath(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * Expects normalized path
 * @param path
 */
export function ParseURLPath(path: string): [RegExp, string[]] {
  // path.replace(/(^|\/):([^/]+)/g, '$1(?<$2>[^/]+)');

  const params: string[] = [];
  const pattern: string = path
    .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') // escape special chars
    .replace(/\\\*\\\*$/g, '(?:.*?)$') // wildcard
    .replace(/(^|\/):([^/]+)/g, (substring: string, ...args: any[]) => {
      if (params.includes(args[1])) {
        throw new Error(`Found a path having identical param's names '${args[1]}'`);
      } else {
        params.push(args[1]);
      }
      return args[0] + '([^/]+)';
    });

  return [
    new RegExp(`^${pattern}`, ''),
    params
  ];
}



export const PATH_MATCHER_PRIVATE = Symbol('path-matcher-private');

export interface IPathMatcherPrivate {
  path: string;
  regExp: RegExp;
  params: string[];
}

export interface IPathMatcherInternal extends IPathMatcher {
  [PATH_MATCHER_PRIVATE]: IPathMatcherPrivate;
}


export function ConstructPathMatcher(pathMatcher: IPathMatcher, path: string): void {
  ConstructClassWithPrivateMembers(pathMatcher, PATH_MATCHER_PRIVATE);
  (pathMatcher as IPathMatcherInternal)[PATH_MATCHER_PRIVATE].path = NormalizeURLPath(path);
  [
    (pathMatcher as IPathMatcherInternal)[PATH_MATCHER_PRIVATE].regExp,
    (pathMatcher as IPathMatcherInternal)[PATH_MATCHER_PRIVATE].params
  ] = ParseURLPath((pathMatcher as IPathMatcherInternal)[PATH_MATCHER_PRIVATE].path);
}

export function PathMatcherExec(pathMatcher: IPathMatcher, path: string): IPathMatcherResult | null {
  path = NormalizeURLPath(path);
  const privates: IPathMatcherPrivate = (pathMatcher as IPathMatcherInternal)[PATH_MATCHER_PRIVATE];

  const match: RegExpExecArray | null = privates.regExp.exec(path);
  if (match === null) {
    return null;
  } else {
    const params: { [key: string]: string } = {};
    for (let i = 0, l = match.length - 1; i < l; i++) {
      params[privates.params[i]] = match[i + 1];
    }
    return {
      params: params,
      remaining: path.substring(match[0].length),
    };
  }
}



export class PathMatcher implements IPathMatcher {
  constructor(path: string) {
    ConstructPathMatcher(this, path);
  }

  get path(): string {
    return ((this as unknown) as IPathMatcherInternal)[PATH_MATCHER_PRIVATE].path;
  }

  exec(path: string): IPathMatcherResult | null {
    return PathMatcherExec(this, path);
  }
}
