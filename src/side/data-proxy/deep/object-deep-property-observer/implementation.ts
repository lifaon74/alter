import { IReadonlyList, Observer, ReadonlyList } from '@lifaon/observables';
import { IObjectDeepProperty } from '../object-deep-property/interfaces';
import { TObjectDeepPropertyObserverCallback } from './types';
import { IObjectDeepPropertyObserver } from './interfaces';

// export function ArrayEquals(array1: any[], array2: any[]): boolean {
//   const length: number = array1.length;
//   if (array2.length === length) {
//     for (let i = 0; i < length; i++) {
//       if (array1[i] !== array2[i]) {
//         return false;
//       }
//     }
//     return true;
//   } else {
//     return false;
//   }
// }

export function ReadonlyListEquals(list1: IReadonlyList<any>, list2: IReadonlyList<any>): boolean {
  return (list1.length === list2.length)
    && list1.every((value: any, index: number) => (value === list2.item(index)));
}

export class ObjectDeepPropertyObserver<TValue> extends Observer<IObjectDeepProperty<TValue>> implements IObjectDeepPropertyObserver<TValue> {
  protected readonly _path: IReadonlyList<PropertyKey>;
  protected readonly _callback: TObjectDeepPropertyObserverCallback<TValue>;

  constructor(path: Iterable<PropertyKey>, callback: TObjectDeepPropertyObserverCallback<TValue>) {
    super((objectProperty: IObjectDeepProperty<TValue>) => {
      if (ReadonlyListEquals(objectProperty.path, this._path)) {
        this._callback.call(this, objectProperty.value);
      }
    });
    this._path = new ReadonlyList(Array.from(path));
    this._callback = callback;
  }

  get path(): IReadonlyList<PropertyKey> {
    return this._path;
  }

  get callback(): TObjectDeepPropertyObserverCallback<TValue> {
    return this._callback;
  }
}

export function IsObjectDeepPropertyObserver<TValue = any>(value: any): value is IObjectDeepPropertyObserver<TValue> {
  return (value instanceof ObjectDeepPropertyObserver);
  // return IsObject(value)
  //   && value.hasOwnProperty(NOTIFICATIONS_OBSERVER_PRIVATE as symbol);
}
