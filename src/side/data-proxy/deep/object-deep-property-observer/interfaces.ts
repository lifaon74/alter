import { IObserver, IReadonlyList } from '@lifaon/observables';
import { IObjectDeepProperty } from '../object-deep-property/interfaces';
import { IObjectDeepPropertyObserverLike, TObjectDeepPropertyObserverCallback } from './types';

export interface IObjectDeepPropertyObserver<TValue> extends IObserver<IObjectDeepProperty<TValue>>, IObjectDeepPropertyObserverLike<TValue> {
  readonly path: IReadonlyList<PropertyKey>;
  readonly callback: TObjectDeepPropertyObserverCallback<TValue>;
}
