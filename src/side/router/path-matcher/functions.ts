import { RegExpEscape } from '../../../misc/helpers/regexp-helpers';

/** FUNCTIONS **/

/**
 * INFO: new Path() is not used because the /:id pattern is an invalid path
 */
export function NormalizeURLPath(path: string): string {
  const url: URL = new URL('http://localhost');
  url.pathname = path;
  return url.pathname;
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
        throw new Error(`Found a path having identical param's names '${ args[1] }'`);
      } else {
        params.push(args[1]);
      }
      return args[0] + '([^/]+)';
    });

  return {
    regExp: new RegExp(`^${ pattern }`, ''),
    params
  };
}
