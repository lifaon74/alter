import { IDynamicEventListener } from './interfaces';
import { EVENTS_OBSERVABLE_PRIVATE, EventsObservable, IEventsObservableInternal } from '../../../../../notifications/observables/events-observable/implementation';
import { OBSERVABLE_PRIVATE, ObservableClearObservers } from '../../../../../core/observable/implementation';
import { INotification } from '../../../../../notifications/core/notification/interfaces';
import { IObserver } from '../../../../../core/observer/interfaces';
import { DOMState, GetNodeDOMState } from '../../../node-state-observable/mutations';
import { GetOrCreateNodeStateObservable } from '../../../node-state-observable/implementation';
import { IEventsObservableKeyValueMapDefault } from '../../../../../notifications/observables/events-observable/interfaces';



// export const DYNAMIC_EVENT_LISTENER_PRIVATE = Symbol('dynamic-event-listener-private');
//
// export interface IDynamicEventListenerPrivate {
// }
//
export interface IDynamicEventListenerInternal extends IDynamicEventListener, IEventsObservableInternal<IEventsObservableKeyValueMapDefault, Element> {
  // [DYNAMIC_EVENT_LISTENER_PRIVATE]: IDynamicEventListenerPrivate;
}


export function ConstructDynamicEventListener(dynamicEventListener: IDynamicEventListener): void {
  // ConstructClassWithPrivateMembers(dynamicEventListener, DYNAMIC_EVENT_LISTENER_PRIVATE);

  const onObserveHook = (dynamicEventListener as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook;
  (dynamicEventListener as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook = (observer: IObserver<INotification<IEventsObservableKeyValueMapDefault>>) => {
    const nodeState: DOMState = GetNodeDOMState((dynamicEventListener as IDynamicEventListenerInternal)[EVENTS_OBSERVABLE_PRIVATE].target);
    if ((nodeState === 'destroyed') || (nodeState === 'destroying')) {
      throw new Error(`Cannot observe a destroyed node`);
    }
    onObserveHook(observer);
  };

  const observer = GetOrCreateNodeStateObservable((dynamicEventListener as IDynamicEventListenerInternal)[EVENTS_OBSERVABLE_PRIVATE].target)
    .addListener('destroy', () => {
      observer.disconnect();
      ObservableClearObservers<INotification<IEventsObservableKeyValueMapDefault>>(dynamicEventListener);
    }).activate();
}



export class DynamicEventListener extends EventsObservable<IEventsObservableKeyValueMapDefault, Element> implements IDynamicEventListener {
  constructor(target: Element, name: string) {
    if (!(target instanceof Element)) {
      throw new TypeError(`Expected Element as target`);
    }
    super(target, name);
    ConstructDynamicEventListener(this);
  }
}
