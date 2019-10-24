import {
  EventsObservableKeyValueMapGeneric, IEventsObservable, IEventsObservableConstructor
} from '@lifaon/observables';

export interface IDynamicEventListenerConstructor extends IEventsObservableConstructor {
  new(target: Element, name: string): IDynamicEventListener;
}

export interface IDynamicEventListener extends IEventsObservable<EventsObservableKeyValueMapGeneric, Element> {

}
