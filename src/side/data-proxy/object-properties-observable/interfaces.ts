import { IObservable } from '@lifaon/observables';
import { TObjectToObjectProperties } from './types';
import { IObjectPropertyObserver } from '../object-property-observer/interfaces';

export interface IObjectPropertiesObservable<TObject extends object> extends IObservable<TObjectToObjectProperties<TObject>> {
  readonly proxy: TObject;

  observeProperty<TKey extends keyof TObject>(key: TKey, callback: (value: TObject[TKey]) => void): IObjectPropertyObserver<TKey, TObject[TKey]>;
}
