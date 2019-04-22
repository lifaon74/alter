import { EventsObservableKeyValueMapGeneric, IEventsObservable, IEventsObservableConstructor } from '@lifaon/observables/public';

export interface IDynamicEventListenerConstructor extends IEventsObservableConstructor {
  new(target: Element, name: string): IDynamicEventListener;
}

export interface IDynamicEventListener extends IEventsObservable<EventsObservableKeyValueMapGeneric, Element> {

}
