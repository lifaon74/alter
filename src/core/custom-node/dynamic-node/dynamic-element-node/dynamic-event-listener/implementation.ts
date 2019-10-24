import { IDynamicEventListener } from './interfaces';
import { EventsObservable, EventsObservableKeyValueMapGeneric, INotification, IObserver } from '@lifaon/observables';
import { DOMState, GetNodeDOMState } from '../../../node-state-observable/mutations';
import { NodeStateObservableStaticOf } from '../../../node-state-observable/implementation';
import { IEventsObservableInternal } from '@lifaon/observables/src/notifications/observables/events/events-observable/implementation';
import { OBSERVABLE_PRIVATE, ObservableClearObservers } from '@lifaon/observables/src/core/observable/implementation';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';


export const DYNAMIC_EVENT_LISTENER_PRIVATE = Symbol('dynamic-event-listener-private');

export interface IDynamicEventListenerPrivate {
}

export interface IDynamicEventListenerInternal extends IDynamicEventListener, IEventsObservableInternal<EventsObservableKeyValueMapGeneric, Element> {
  [DYNAMIC_EVENT_LISTENER_PRIVATE]: IDynamicEventListenerPrivate;
}


export function ConstructDynamicEventListener(instance: IDynamicEventListener): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_EVENT_LISTENER_PRIVATE);

  const _onObserveHook = (instance as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook;
  (instance as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook = function onObserveHook(observer: IObserver<INotification<string, Event>>) {
    const nodeState: DOMState = GetNodeDOMState(instance.target);
    if ((nodeState === 'destroyed') || (nodeState === 'destroying')) {
      throw new Error(`Cannot observe a destroyed node`);
    }
    _onObserveHook.call(this, observer);
  };

  const observer = NodeStateObservableStaticOf(instance.target)
    .addListener('destroy', () => {
      observer.disconnect();
      ObservableClearObservers<INotification<string, Event>>(instance);
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
