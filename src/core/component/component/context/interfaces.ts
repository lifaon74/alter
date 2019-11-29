import { INotificationsObservable } from '@lifaon/observables';
import { IComponentContextAttributeListenerKeyValueMap } from './types';

/** INTERFACES **/

/* PRIVATE */
export interface IComponentContextConstructor {
  new<TData extends object>(): IComponentContext<TData>;
}

export interface IComponentContext<TData extends object> {
  data: TData;
  readonly frozen: boolean;
  readonly attributeListener: INotificationsObservable<IComponentContextAttributeListenerKeyValueMap>;
}
