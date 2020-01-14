import { IObservable, IObservableConstructor } from '@lifaon/observables';
import { TObjectToObjectProperties } from './types';
import { IObjectPropertyObserver } from '../object-property-observer/interfaces';

/** INTERFACES **/

export interface IObjectPropertiesObservableStaticConstructor extends Omit<IObservableConstructor, 'new'> {
  of<TObject extends object>(object: TObject): IObjectPropertiesObservable<TObject>;
}

export interface IObjectPropertiesObservableConstructor extends IObjectPropertiesObservableStaticConstructor {
  // new<TObject extends object>(object: TObject): IObjectPropertiesObservable<TObject>;
}

export interface IObjectPropertiesObservablePrivateConstructor extends IObjectPropertiesObservableStaticConstructor {
  new<TObject extends object>(object: TObject): IObjectPropertiesObservable<TObject>;
}

export interface IObjectPropertiesObservable<TObject extends object> extends IObservable<TObjectToObjectProperties<TObject>> {
  readonly proxy: TObject;

  observeProperty<TKey extends keyof TObject>(key: TKey, callback: (value: TObject[TKey]) => void): IObjectPropertyObserver<TKey, TObject[TKey]>;
}
