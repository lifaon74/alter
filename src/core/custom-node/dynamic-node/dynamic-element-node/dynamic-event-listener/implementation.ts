import { IDynamicEventListener } from './interfaces';
import { EventsObservable, EventsObservableKeyValueMapGeneric, INotification, IObserver, IEventLike, Observable } from '@lifaon/observables';
import { DOMState, GetNodeDOMState } from '../../../node-state-observable/mutations';
import { NodeStateObservableStaticOf } from '../../../node-state-observable/implementation';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IEventsObservablePrivatesInternal } from '@lifaon/observables/types/notifications/observables/events/events-observable/privates';

/** FUNCTIONS **/

// WARN extreme ugly fix
const OBSERVABLE_PRIVATE: symbol = ((): symbol => {
  const OBSERVABLE_PRIVATE: symbol | undefined = Object.getOwnPropertySymbols(new Observable()).find((_symbol: symbol) => {
    return _symbol.toString().includes('observable-private');
  });
  if (OBSERVABLE_PRIVATE === void 0) {
    throw new Error(`Cannot extract OBSERVABLE_PRIVATE`);
  } else {
    return OBSERVABLE_PRIVATE;
  }
})();

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
