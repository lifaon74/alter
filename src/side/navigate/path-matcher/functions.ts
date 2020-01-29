import { RegExpEscape } from '../../../misc/helpers/regexp-helpers';
import { Path } from '@lifaon/path';

/** FUNCTIONS **/

export function EncodeURLPathForPath(path: string): string {
  return path
    .replace(/:/g, '--colon--')
    .replace(/\*/g, '--asterisk--');
}

export function DecodePathForURLPath(path: string): string {
  return path
    .replace(/--colon--/g, ':')
    .replace(/--asterisk--/g, '*');
}

export function NormalizeURLPath(path: string): string {
  return DecodePathForURLPath(
    Path.of(EncodeURLPathForPath(path), Path.posix)
      .forceAbsolute('/')
      .toString()
  );

  // INFO: new Path() is not used because the /:id pattern is an invalid path
  // => problem: url.pathname is not really precise
  // const url: URL = new URL('http://localhost');
  // url.pathname = path;
  // if (url.pathname.endsWith('/')) {
  //   url.pathname = url.pathname.slice(0, -1);
  // }
  // return url.pathname;
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
