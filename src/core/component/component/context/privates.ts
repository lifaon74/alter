import { IComponentContext } from './interfaces';
import { INotificationsObservable, INotificationsObservableContext } from '@lifaon/observables';
import { IComponentContextAttributeListenerKeyValueMap } from './types';

/** PRIVATES **/

export const COMPONENT_CONTEXT_PRIVATE = Symbol('component-context-private');

export interface IComponentContextPrivate<TData extends object> {
  data: TData;
  frozen: boolean;
  attributeListener: INotificationsObservable<IComponentContextAttributeListenerKeyValueMap>;
  context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap>;
}

export interface IComponentContextPrivatesInternal<TData extends object> {
  [COMPONENT_CONTEXT_PRIVATE]: IComponentContextPrivate<TData>;
}

export interface IComponentContextInternal<TData extends object> extends IComponentContextPrivatesInternal<TData>, IComponentContext<TData> {
}
