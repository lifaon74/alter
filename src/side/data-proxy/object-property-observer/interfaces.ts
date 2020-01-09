import { IObserver } from '@lifaon/observables';
import { IObjectProperty } from '../object-property/interfaces';
import { IObjectPropertyObserverLike, TObjectPropertyObserverCallback } from './types';

export interface IObjectPropertyObserver<TKey extends PropertyKey, TValue> extends IObserver<IObjectProperty<TKey, TValue>>, IObjectPropertyObserverLike<TKey, TValue> {
  readonly key: TKey;
  readonly callback: TObjectPropertyObserverCallback<TValue>;
}
