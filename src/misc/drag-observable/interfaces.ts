import { IDragObservableKeyValueMap } from './types';
import { INotificationsObservable, INotificationsObservableConstructor } from '@lifaon/observables';

/** INTERFACES **/

export interface IDragObservableConstructor extends Omit<INotificationsObservableConstructor, 'new'> {
  new<TElement extends Element>(target: TElement): IDragObservable<TElement>;
}

export interface IDragObservable<TElement extends Element> extends INotificationsObservable<IDragObservableKeyValueMap> {
  readonly target: TElement;
}
