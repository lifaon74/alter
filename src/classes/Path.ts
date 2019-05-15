export type PathSegments = string[];

export interface PlatformConfig {
  rootPattern: string;
  rootRegExp: RegExp;
  separator: string;
}

export const WINDOWS_ROOT_PATTERN: string = '(?:[a-zA-Z]:)'; // on windows, root startsWith 'letter:';
export const WINDOWS_ROOT_REGEXP: RegExp = new RegExp('^(' + WINDOWS_ROOT_PATTERN + ')([\\\/]|$)');
export const WINDOWS_SEPARATOR: string = '\\';

export const WINDOWS_CONFIG: PlatformConfig = {
  rootPattern: WINDOWS_ROOT_PATTERN,
  rootRegExp: WINDOWS_ROOT_REGEXP,
  separator: WINDOWS_SEPARATOR,
};

export const LINUX_ROOT_PATTERN: string = ''; // on linux, root startsWith '/', so the part before is the empty string
export const LINUX_ROOT_REGEXP: RegExp = new RegExp('^(' + LINUX_ROOT_PATTERN + ')([\\\/]|$)');
export const LINUX_SEPARATOR: string = '/';

export const LINUX_CONFIG: PlatformConfig = {
  rootPattern: LINUX_ROOT_PATTERN,
  rootRegExp: LINUX_ROOT_REGEXP,
  separator: LINUX_SEPARATOR,
};

export const ROOT_PATTERN: string = WINDOWS_ROOT_PATTERN + '|' + LINUX_ROOT_PATTERN;
export const ROOT_REGEXP: RegExp = new RegExp('^(' + ROOT_PATTERN + ')([\\\/]|$)');

export class Path {

  static windows: PlatformConfig = WINDOWS_CONFIG;
  static linux: PlatformConfig = LINUX_CONFIG;

  static rootRegExp = ROOT_REGEXP;
  static sep = LINUX_SEPARATOR;

  static isAbsolute(path: string, root = this.rootRegExp): boolean {
    return root.test(path);
  }

  static isRoot(path: string, root = this.rootRegExp, normalize: boolean = true): boolean {
    return this.isRootPathSegments(this.split(path, normalize), root, false);
  }

  static normalize(path: string): string {
    return this.unsplit(this.split(path));
  }

  static commonBase(paths: string[], normalize: boolean = true): string {
    return this.unsplit(this.commonBasePathSegments(paths.map((path: string) => this.split(path, normalize)), false));
  }

  static contains(path: string, contains: string, normalize: boolean = true): boolean {
    return this.containsPathSegments(this.split(path, normalize), this.split(contains, normalize), false);
  }

  static join(paths: string[], strict: boolean = true): string {
    return this.unsplit(this.joinPathSegments(paths.map((path: string) => this.split(path, false)), strict));
  }

  static relative(from: string, to: string, normalize: boolean = true): string {
    return this.unsplit(this.relativePathSegments(this.split(from, normalize), this.split(to, normalize), false));
  }

  static resolve(path: string, root?: string, normalize: boolean = true): string {
    return this.unsplit(this.resolvePathSegments(this.split(path, false), root ? this.split(root, false) : void 0, normalize));
  }


  static dirname(path: string, normalize: boolean = true): string {
    return this.unsplit(this.dirNamePathSegments(this.split(path, normalize), false));
  }

  static basename(path: string, ext?: string, normalize: boolean = true): string {
    return this.baseNamePathSegments(this.split(path, normalize), ext, false);
  }

  static extname(path: string, normalize: boolean = true): string {
    return this.extNamePathSegments(this.split(path, normalize), false);
  }

  static stemname(path: string, normalize: boolean = true): string {
    return this.stemNamePathSegments(this.split(path, normalize), false);
  }


  static root(path: string, root?: string, normalize: boolean = true): string {
    return this.unsplit(this.rootPathSegments(this.split(path, false), root, normalize));
  }

  static unroot(path: string, normalize: boolean = true): string {
    return this.unsplit(this.unrootPathSegments(this.split(path, normalize), false));
  }


  /******
   * PathSegments
   ******/

  static isAbsolutePathSegments(path: PathSegments, root: RegExp = this.rootRegExp): boolean {
    return ((path.length > 0) && root.test(path[0]));
  }

  /**
   * Returns true if the path is the root.
   * @param path
   * @param root
   * @param normalize
   */
  static isRootPathSegments(path: PathSegments, root: RegExp = this.rootRegExp, normalize: boolean = true): boolean {
    if (normalize) {
      path = this.normalizePathSegments(path);
    }
    return ((path.length === 1) && root.test(path[0]));
  }

  /**
   * Normalizes a PathSegments, removing unnecessary '..', '.' and ''
   * starts with '.' or '..' if relative
   * OR starts with [root] if absolute
   * @param {PathSegments} path
   * @returns {PathSegments}
   */
  static normalizePathSegments(path: PathSegments): PathSegments {
    const normalized: string[] = [];
    for (let i = 0; i < path.length; i++) {
      const part: string = path[i];

      if ((i === 0) && this.rootRegExp.test(part)) { // root
        normalized.unshift(part);
      } else {
        if (part === '') {
          // noop
        } else if (part === '.') {
          // noop
        } else if (part === '..') {
          const previousPart: string = normalized[normalized.length - 1];
          if ((normalized.length > 0) && (previousPart !== '..')) {
            if (!this.rootRegExp.test(previousPart)) normalized.pop();
          } else {
            normalized.push('..');
          }
        } else {
          if (this.checkEntryNameValidity(part)) {
            normalized.push(part);
          }
        }
      }

      // console.log(normalized);
    }

    if ((normalized.length === 0) || ((!this.rootRegExp.test(normalized[0])) && (normalized[0] !== '.') && (normalized[0] !== '..'))) {
      normalized.unshift('.');
    }

    return normalized;
  }

  /**
   * Extracts the common base from many PathSegments
   * Returns :
   * [] if no common base path,
   * ['', ...] if common base is absolute
   * or  ['..' | '.', ...] if common  base is relative
   * @param {PathSegments[]} paths
   * @param {boolean} normalize
   * @returns {PathSegments}
   */
  static commonBasePathSegments(paths: PathSegments[], normalize: boolean = true): PathSegments {
    if (paths.length === 0) return [];
    if (normalize) paths = paths.map((path: PathSegments) => this.normalizePathSegments(path));
    if (paths.length === 1) return paths[0];
    const commonBase: PathSegments = [];

    let part: string;
    let path: PathSegments;
    let commonBaseLength: number;
    while (true) {
      commonBaseLength = commonBase.length;
      path = paths[0];
      part = path[commonBaseLength];
      for (let i = 1; i < paths.length; i++) {
        path = paths[i];
        if ((path.length <= commonBaseLength) || (path[commonBaseLength] !== part)) return commonBase;
      }
      commonBase.push(part);
    }
  }


  /**
   * Returns true if 'path' contains 'contains'
   * @param {PathSegments} path
   * @param {PathSegments} contains
   * @param {boolean} normalize
   * @returns {boolean}
   */
  static containsPathSegments(path: PathSegments, contains: PathSegments, normalize: boolean = true): boolean {
    if (normalize) {
      path = this.normalizePathSegments(path);
      contains = this.normalizePathSegments(contains);
    }

    for (let i = 0, l = Math.min(path.length, contains.length); i < l; i++) {
      if (path[i] !== contains[i]) return false;
    }
    return true;
  }


  /**
   * Joins and normalizes many PathSegments
   * Pretty close to normalizePathSegments(['a'].concat(['b']))
   * @param {PathSegments[]} paths
   * @param {boolean} strict
   * @returns {PathSegments}
   */
  static joinPathSegments(paths: PathSegments[], strict: boolean = true): PathSegments {
    const joined: PathSegments = [];
    let path: PathSegments;
    for (let i = 0; i < paths.length; i++) {
      path = paths[i];
      if (this.isAbsolutePathSegments(path) && (i > 0)) {
        if (strict) {
          throw new SyntaxError('Only the first path can be absolute.');
        } else {
          path = this.unrootPathSegments(path);
        }
      }
      Array.prototype.push.apply(joined, path);
    }
    return this.normalizePathSegments(joined);
  }

  /**
   * Returns the relative PathSegments between 'from' and 'to'
   * if no common base path => []
   * else ['..' | '.', ...]
   * @param {PathSegments} from
   * @param {PathSegments} to
   * @param {boolean} normalize
   * @returns {PathSegments}
   */
  static relativePathSegments(from: PathSegments, to: PathSegments, normalize: boolean = true): PathSegments {
    if (normalize) {
      from = this.normalizePathSegments(from);
      to = this.normalizePathSegments(to);
    }
    const commonBase: PathSegments = this.commonBasePathSegments([from, to], false);
    if (commonBase.length === 0) return [];

    const relativePath: PathSegments = [];
    for (let i = commonBase.length, l = from.length; i < l; i++) {
      relativePath.push('..');
    }
    for (let i = commonBase.length, l = to.length; i < l; i++) {
      relativePath.push(to[i]);
    }
    return this.normalizePathSegments(relativePath);
  }


  /**
   * Convert a path to an absolute path
   * @param {PathSegments} path
   * @param {PathSegments} root
   * @param {boolean} normalize
   * @returns {PathSegments}
   */
  static resolvePathSegments(path: PathSegments, root: PathSegments = this.split(process.cwd(), false), normalize: boolean = true): PathSegments {
    if (normalize) {
      path = this.normalizePathSegments(path);
      root = this.normalizePathSegments(root);
    }

    if (!this.isAbsolutePathSegments(root)) {
      throw new Error('Argument \'root\' is not a valid root');
    }

    switch (path[0]) {
      case '.':
      case '..':
        path = this.joinPathSegments([root, path]);
        break;
    }
    return path;
  }


  /**
   * Returns the parent directory PathSegments of 'path'
   * @param {PathSegments} path
   * @param {boolean} normalize
   * @returns {PathSegments}
   */
  static dirNamePathSegments(path: PathSegments, normalize: boolean = true): PathSegments {
    return (normalize ? this.normalizePathSegments(path) : path).slice(0, -1);
  }

  /**
   * Returns the basename of PathSegments
   * @param {PathSegments} path
   * @param {string} ext
   * @param {boolean} normalize
   * @returns {string}
   */
  static baseNamePathSegments(path: PathSegments, ext?: string, normalize: boolean = true): string {
    if (normalize) {
      path = this.normalizePathSegments(path);
    }
    if (path.length > 0) {
      let basename: string = path[path.length - 1];
      if (basename === '') {
        return '/';
      } else if (basename === '.') {
        return '.';
      } else if (basename === '..') {
        return '..';
      } else {
        if (ext) {
          ext = ext.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
          return basename.replace(new RegExp(ext + '$', 'g'), '');
        } else {
          return basename;
        }
      }
    } else {
      return '';
    }
  }


  /**
   * Returns the extension of PathSegments
   * @param {PathSegments} path
   * @param {boolean} normalize
   * @returns {string}
   */
  static extNamePathSegments(path: PathSegments, normalize: boolean = true): string {
    const baseName: string = this.baseNamePathSegments(path, void 0, normalize);
    const parts: string[] = baseName.split('.');
    return ((parts.length === 1) || (parts[0].length === 0))
      ? ''
      : ('.' + parts[parts.length - 1]);
  }

  /**
   * Returns the stem of PathSegments
   * @param {PathSegments} path
   * @param {boolean} normalize
   * @returns {string}
   */
  static stemNamePathSegments(path: PathSegments, normalize: boolean = true): string {
    if (normalize) path = this.normalizePathSegments(path);
    return this.baseNamePathSegments(path, this.extNamePathSegments(path, false), false);
  }


  /**
   * Convert a relative path to an absolute path,
   * some kind of light resolve
   * @param {PathSegments} path
   * @param {string} root
   * @param {boolean} normalize
   * @returns {PathSegments}
   */
  static rootPathSegments(path: PathSegments, root: string = '', normalize: boolean = true): PathSegments {
    path = normalize ? this.normalizePathSegments(path) : path.slice(0);
    if (root === '/') {
      root = '';
    }
    if (!this.rootRegExp.test(root)) {
      throw new Error('Argument \'root\' is not a valid root');
    }

    switch (path[0]) {
      case '.':
        path[0] = root;
        break;
      case '..':
        while (path[0] === '..') {
          path.shift();
        }
        path.unshift(root);
        break;
    }
    return path;
  }

  /**
   * Convert an absolute path to a relative path
   * @param {PathSegments} path
   * @param {boolean} normalize
   * @returns {PathSegments}
   */
  static unrootPathSegments(path: PathSegments, normalize: boolean = true): PathSegments {
    path = normalize ? this.normalizePathSegments(path) : path.slice(0);
    if (this.rootRegExp.test(path[0])) {
      path[0] = '.';
    }
    return path;
  }


  static split(path: string, normalize: boolean = true): PathSegments {
    return normalize
      ? this.normalizePathSegments(this.split(path, false))
      : ((path === '') ? [] : path.split(/[\\\/]/));
  }

  static unsplit(path: PathSegments, separator = this.sep): string {
    return this.isRootPathSegments(path)
      ? (path[0] + this.sep)
      : path.join(separator);
  }


  static checkPathValidity(path: string): boolean {
    return this.split(path).every(this.checkPathPartValidity);
  }

  static checkPathPartValidity(part: string): boolean {
    return (part !== '') && !(/[<>:"\/\\|?*]/g.test(part));
  }

  static checkEntryNameValidity(name: string): boolean {
    return this.checkPathPartValidity(name) && (name !== '..') && (name !== '.');
  }

}