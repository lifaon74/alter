import { Observer } from '@lifaon/observables';
import { IObjectProperty } from '../object-property/interfaces';
import { IObjectPropertyObserver } from './interfaces';
import { TObjectPropertyObserverCallback } from './types';

export class ObjectPropertyObserver<TKey extends PropertyKey, TValue> extends Observer<IObjectProperty<TKey, TValue>> implements IObjectPropertyObserver<TKey, TValue> {
  protected readonly _key: TKey;
  protected readonly _callback: TObjectPropertyObserverCallback<TValue>;

  constructor(key: TKey, callback: TObjectPropertyObserverCallback<TValue>) {
    super((objectProperty: IObjectProperty<TKey, TValue>) => {
      if (objectProperty.key === this._key) {
        this._callback.call(this, objectProperty.value);
      }
    });
    this._key = key;
    this._callback = callback;
  }

  get key(): TKey {
    return this._key;
  }

  get callback(): TObjectPropertyObserverCallback<TValue> {
    return this._callback;
  }
}

export function IsObjectPropertyObserver<TKey extends PropertyKey = PropertyKey, TValue = any>(value: any): value is IObjectPropertyObserver<TKey, TValue> {
  return (value instanceof ObjectPropertyObserver);
  // return IsObject(value)
  //   && value.hasOwnProperty(NOTIFICATIONS_OBSERVER_PRIVATE as symbol);
}
