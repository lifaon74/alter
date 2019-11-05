import { TPathInput, Path, IPath } from '@lifaon/path';

export type TURLInput =
  string // the url as a string
  | URL
  | { toString(): string } // an object castable to string


/**
 * Returns an URL build from a module's url (ex: import.meta.url => 'file:///home/user/module.js'), and a relative 'path'
 */
export function RelativeURLPath(moduleURL: TURLInput, path: TPathInput): URL {
  const _moduleURL: URL = new URL(
    moduleURL.toString(),
    window.origin
  );

  const _path: IPath = Path.of(path);

  const root: IPath | null = new Path(_moduleURL.pathname).dirname();
  _moduleURL.pathname = _path.resolve((root === null) ? '/' : root).toString();

  return _moduleURL;
}
