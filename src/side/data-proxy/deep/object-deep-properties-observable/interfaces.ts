import { IObservable } from '@lifaon/observables';
import { IObjectDeepPropertyObserver } from '../object-deep-property-observer/interfaces';
import { IObjectDeepProperty } from '../object-deep-property/interfaces';

export interface IObjectDeepPropertiesObservable<TObject extends object> extends IObservable<IObjectDeepProperty<any>> {
  readonly proxy: TObject;

  observeProperty<TValue>(path: Iterable<PropertyKey>, callback: (value: TValue) => void): IObjectDeepPropertyObserver<TValue>;
}
