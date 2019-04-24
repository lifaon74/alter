import { IDynamicEventListener } from './interfaces';
import { EventsObservable, EventsObservableKeyValueMapGeneric, INotification, IObserver } from '@lifaon/observables/public';
import { DOMState, GetNodeDOMState } from '../../../node-state-observable/mutations';
import { NodeStateObservableOf } from '../../../node-state-observable/implementation';
import { EVENTS_OBSERVABLE_PRIVATE, IEventsObservableInternal } from '@lifaon/observables/notifications/observables/events-observable/implementation';
import { OBSERVABLE_PRIVATE, ObservableClearObservers } from '@lifaon/observables/core/observable/implementation';



// export const DYNAMIC_EVENT_LISTENER_PRIVATE = Symbol('dynamic-event-listener-private');
//
// export interface IDynamicEventListenerPrivate {
// }
//
export interface IDynamicEventListenerInternal extends IDynamicEventListener, IEventsObservableInternal<EventsObservableKeyValueMapGeneric, Element> {
  // [DYNAMIC_EVENT_LISTENER_PRIVATE]: IDynamicEventListenerPrivate;
}


export function ConstructDynamicEventListener(dynamicEventListener: IDynamicEventListener): void {
  // ConstructClassWithPrivateMembers(dynamicEventListener, DYNAMIC_EVENT_LISTENER_PRIVATE);

  const onObserveHook = (dynamicEventListener as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook;
  (dynamicEventListener as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook = (observer: IObserver<INotification<string, Event>>) => {
    const nodeState: DOMState = GetNodeDOMState((dynamicEventListener as IDynamicEventListenerInternal)[EVENTS_OBSERVABLE_PRIVATE].target);
    if ((nodeState === 'destroyed') || (nodeState === 'destroying')) {
      throw new Error(`Cannot observe a destroyed node`);
    }
    onObserveHook(observer);
  };

  const observer = NodeStateObservableOf((dynamicEventListener as IDynamicEventListenerInternal)[EVENTS_OBSERVABLE_PRIVATE].target)
    .addListener('destroy', () => {
      observer.disconnect();
      ObservableClearObservers<INotification<string, Event>>(dynamicEventListener);
    }).activate();
}



export class DynamicEventListener extends EventsObservable<EventsObservableKeyValueMapGeneric, Element> implements IDynamicEventListener {
  constructor(target: Element, name: string) {
    if (!(target instanceof Element)) {
      throw new TypeError(`Expected Element as target`);
    }
    super(target, name);
    ConstructDynamicEventListener(this);
  }
}
