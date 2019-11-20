import { IDynamicEventListener } from './interfaces';
import { EventsObservable, EventsObservableKeyValueMapGeneric, INotification, IObserver } from '@lifaon/observables';
import { DOMState, GetNodeDOMState } from '../../../node-state-observable/mutations';
import { NodeStateObservableStaticOf } from '../../../node-state-observable/implementation';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IEventLike } from '@lifaon/observables/types/notifications/observables/events/events-listener/event-like/interfaces';
import { IEventsObservablePrivatesInternal } from '@lifaon/observables/types/notifications/observables/events/events-observable/privates';
import { OBSERVABLE_PRIVATE } from '@lifaon/observables/types/core/observable/privates';

/** PRIVATES **/

export const DYNAMIC_EVENT_LISTENER_PRIVATE = Symbol('dynamic-event-listener-private');

export interface IDynamicEventListenerPrivate {
}

export interface IDynamicEventListenerPrivatesInternal extends IEventsObservablePrivatesInternal<EventsObservableKeyValueMapGeneric, Element> {
  [DYNAMIC_EVENT_LISTENER_PRIVATE]: IDynamicEventListenerPrivate;
}

export interface IDynamicEventListenerInternal extends IDynamicEventListenerPrivatesInternal, IDynamicEventListener {
}


/** CONSTRUCTOR **/

export function ConstructDynamicEventListener(instance: IDynamicEventListener): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_EVENT_LISTENER_PRIVATE);

  const _onObserveHook = (instance as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook;
  (instance as IDynamicEventListenerInternal)[OBSERVABLE_PRIVATE].onObserveHook = function onObserveHook(observer: IObserver<INotification<string, IEventLike>>) {
    const nodeState: DOMState = GetNodeDOMState(instance.target);
    if ((nodeState === 'destroyed') || (nodeState === 'destroying')) {
      throw new Error(`Cannot observe a destroyed node`);
    }
    _onObserveHook.call(this, observer);
  };

  const observer = NodeStateObservableStaticOf(instance.target)
    .addListener('destroy', () => {
      observer.disconnect();
      instance.clearObservers();
    }).activate();
}

/** CLASS **/

export class DynamicEventListener extends EventsObservable<EventsObservableKeyValueMapGeneric, Element> implements IDynamicEventListener {
  constructor(target: Element, name: string) {
    if (!(target instanceof Element)) {
      throw new TypeError(`Expected Element as target`);
    }
    super(target, name);
    ConstructDynamicEventListener(this);
  }
}
