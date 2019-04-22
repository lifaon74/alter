import { IEventsObservable, IEventsObservableConstructor, IEventsObservableKeyValueMapDefault } from '../../../../../notifications/observables/events-observable/interfaces';

export interface IDynamicEventListenerConstructor extends IEventsObservableConstructor {
  new(target: Element, name: string): IDynamicEventListener;
}

export interface IDynamicEventListener extends IEventsObservable<IEventsObservableKeyValueMapDefault, Element> {

}
