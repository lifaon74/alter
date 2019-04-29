import { IPromiseCancelToken, TPromiseType } from '@lifaon/observables/public';

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


export function wrapToken<CB extends (...args: any[]) => any>(callback: CB, token?: IPromiseCancelToken): (...args: Parameters<CB>) => Promise<TPromiseType<ReturnType<CB>>> {
  if (token === void 0) {
    return function (...args: Parameters<CB>): Promise<TPromiseType<ReturnType<CB>>> {
      return new Promise<TPromiseType<ReturnType<CB>>>((resolve: any) => {
        resolve(callback.apply(this, args));
      });
    };
  } else {
    return token.wrap<CB>(callback);
  }
}
