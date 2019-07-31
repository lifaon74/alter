import { ICancelToken, TPromiseType } from '@lifaon/observables/public';
import { Path } from './classes/Path';

export function noop() {}

export function EnumToString<T>(values: T[]): string {
  let string: string = '';
  for (let i = 0, l = values.length; i < l; i++) {
    if (i > 0) {
      string += (i === (l - 1)) ? ' or ' : ',';
    }
    string += `'${values[i]}'`;
  }
  return string;
}

export function MathClosestTo(targetValue: number, ...values: number[]): number {
  let closest: number = values[0];
  let closestDistance: number = Math.abs(values[0] - targetValue);

  let distance: number;
  for (let i = 1, l = values.length; i < l; i++) {
    distance = Math.abs(values[i] - targetValue);
    if (distance < closestDistance) {
      closest = values[i];
      closestDistance = distance;
    }
  }
  return closest;
}

export function IsObject<T extends object = object>(value: any): value is T {
  return (typeof value === 'object') && (value !== null);
}

export function AppendToSet<T>(set: Set<T>, values: Iterable<T>): Set<T> {
  const iterator: Iterator<T> = values[Symbol.iterator]();
  let result: IteratorResult<T>;
  while (!(result = iterator.next()).done) {
    set.add(result.value);
  }
  return set;
}

export function RelativeURLPath(moduleURL: string, path: string): string {
  const url: URL = new URL(moduleURL, window.origin);
  url.pathname = Path.unsplit(Path.resolvePathSegments(Path.split(path), Path.dirNamePathSegments(Path.split(url.pathname), false), false));
  return url.href;
}

export function IsDevToolOpened(): boolean {
  const devtools: any = function() {};
  devtools.toString = function() {
    devtools.opened = true;
  };

  console.log('%c', devtools);
  return devtools.opened;
}
