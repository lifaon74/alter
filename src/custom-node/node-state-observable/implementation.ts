import { INotificationsObservableInternal, NotificationsObservable, NotificationsObservableDispatch } from '../../../notifications/core/notifications-observable/implementation';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IObservablePrivate, OBSERVABLE_PRIVATE } from '../../../core/observable/implementation';
import { INotification } from '../../../notifications/core/notification/interfaces';
import { IObserver } from '../../../core/observer/interfaces';
import { INodeStateObservable, INodeStateObservableKeyValueMap, TNodeState, TNodeStateObservablePreventableType } from './interfaces';
import { IPreventable } from '../../../notifications/core/preventable/interfaces';
import { Preventable } from '../../../notifications/core/preventable/implementation';
import { Observer } from '../../../core/observer/public';
import { DOMChangeObservable } from '../../../observables/dom-change/implementations';

export const NODE_STATE_OBSERVABLE_PRIVATE = Symbol('node-state-observable-private');

export interface INodeStateObservablePrivate {
  node: Node;

  referenceNode: Node | null;
  useReferenceNode: boolean;
  useDOMObserver: boolean;

  observer: IObserver<void>;

  attachDetected: boolean;
  detachDetected: boolean;
  state: TNodeState;

  onBeforeAttach(event?: IPreventable<TNodeStateObservablePreventableType>): void;
  onBeforeDetach(event?: IPreventable<TNodeStateObservablePreventableType>): void;
  onAfterAttach(event?: IPreventable<TNodeStateObservablePreventableType>): void;
  onAfterDetach(event?: IPreventable<TNodeStateObservablePreventableType>): void;
  onDestroy(event?: IPreventable<TNodeStateObservablePreventableType>): void;

  onConnect(): void;
  onDisconnect(): void;
}

export interface INodeStateObservableInternal extends INodeStateObservable, INotificationsObservableInternal<INodeStateObservableKeyValueMap> {
  [NODE_STATE_OBSERVABLE_PRIVATE]: INodeStateObservablePrivate;
}



export const NodeStateObservableWeakMap: WeakMap<Node, INodeStateObservable[]> = new WeakMap<Node, INodeStateObservable[]>();
const StaticDOMChangeObservable = new DOMChangeObservable();


export function ConstructNodeStateObservable(observable: INodeStateObservable, node: Node): void {
  ConstructClassWithPrivateMembers(observable, NODE_STATE_OBSERVABLE_PRIVATE);
  const privates: INodeStateObservablePrivate = (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];
  const observablePrivates: IObservablePrivate<INotification<INodeStateObservableKeyValueMap>> = (observable as INodeStateObservableInternal)[OBSERVABLE_PRIVATE];

  privates.node = node;
  privates.referenceNode = null;
  privates.useReferenceNode = false;
  privates.useDOMObserver = false;

  privates.observer = new Observer<void>(() => { // something append in the DOM

    // console.log('DOM detect');
    const connected: boolean = privates.node.ownerDocument.contains(privates.node);
    if (privates.node.nextSibling !== privates.referenceNode) { // mutation (moved, attached or detached) OR already in detached state
      if (connected) { // in the dom => moved or attached
        if (privates.referenceNode.parentNode !== null) { // moved
          if (!privates.detachDetected) {
            // console.log('DOM detach');
            NodeStateObservableOnAfterDetach(observable);
            DispatchEventInSubTree(privates.node, 'onDisconnect');
          }
        }
        if (!privates.attachDetected) {
          // console.log('DOM attach');
          // NodeStateObservableOnAfterAttach(observable);
          NodeStateObservableDispatchEvent(privates.node, 'onAfterAttach');
          if (connected) {
            DispatchEventInSubTree(privates.node, 'onConnect');
          }
        }
      } else { // detached OR already in detached state
        if (privates.referenceNode.parentNode !== null) { // detached
          if (!privates.detachDetected) {
            // console.log('DOM detach');
            // NodeStateObservableOnAfterDetach(observable);
            NodeStateObservableDispatchEvent(privates.node, 'onAfterDetach');
            DispatchEventInSubTree(privates.node, 'onDisconnect');
          }
        }
      }
    }
    privates.attachDetected = false;
    privates.detachDetected = false;

    if ((privates.state === 'connected') !== connected) { // not detected
      DispatchEventInSubTree(privates.node, connected ? 'onConnect' : 'onDisconnect');
      privates.state = connected ? 'connected' : 'disconnected';
    }
  }).observe(StaticDOMChangeObservable);

  privates.attachDetected = false;
  privates.detachDetected = false;

  privates.state = privates.node.ownerDocument.contains(privates.node) ? 'connected' : 'disconnected';

  // the on... functions are called by the mutations functions
  privates.onBeforeAttach = (event: IPreventable<TNodeStateObservablePreventableType>) => {
    NotificationsObservableDispatch<INodeStateObservableKeyValueMap, 'beforeAttach'>(observable, 'beforeAttach', event);
  };

  privates.onBeforeDetach = (event: IPreventable<TNodeStateObservablePreventableType>) => {
    NotificationsObservableDispatch<INodeStateObservableKeyValueMap, 'beforeDetach'>(observable, 'beforeDetach', event);
  };

  privates.onAfterAttach = () => {
    privates.attachDetected = true;
    NodeStateObservableOnAfterAttach(observable);
  };

  privates.onAfterDetach = () => {
    privates.detachDetected = true;
    NodeStateObservableOnAfterDetach(observable);
  };

  privates.onDestroy = () => {
    privates.state = 'destroyed';
    NodeStateObservableDeactivateDOMObserver(observable);
    NotificationsObservableDispatch<INodeStateObservableKeyValueMap, 'destroy'>(observable, 'destroy');
  };


  privates.onConnect = () => {
    privates.state = 'connected';
    NotificationsObservableDispatch<INodeStateObservableKeyValueMap, 'connect'>(observable, 'connect');
  };

  privates.onDisconnect = () => {
    privates.state = 'disconnected';
    NotificationsObservableDispatch<INodeStateObservableKeyValueMap, 'disconnect'>(observable, 'disconnect');
  };


  // register observable
  if (!NodeStateObservableWeakMap.has(node)) {
    NodeStateObservableWeakMap.set(node, []);
  }
  NodeStateObservableWeakMap.get(node).push(observable);

  const onObserveHook = observablePrivates.onObserveHook;
  (observable as INodeStateObservableInternal)[OBSERVABLE_PRIVATE].onObserveHook = (observer: IObserver<INotification<INodeStateObservableKeyValueMap>>) => {
    NodeStateObservableUseDOMObserverUpdate(observable);
    onObserveHook(observer);
  };

  const onUnobserveHook = observablePrivates.onUnobserveHook;
  (observable as INodeStateObservableInternal)[OBSERVABLE_PRIVATE].onUnobserveHook = (observer: IObserver<INotification<INodeStateObservableKeyValueMap>>) => {
    NodeStateObservableUseDOMObserverUpdate(observable);
    onUnobserveHook(observer);
  };
}

export type TNodeStateObservableEventType = 'onBeforeAttach' | 'onBeforeDetach' | 'onAfterAttach' | 'onAfterDetach' | 'onConnect' | 'onDisconnect' | 'onDestroy'



export function NodeStateObservableDispatchEvent(node: Node, name: TNodeStateObservableEventType, event?: IPreventable<TNodeStateObservablePreventableType>): void {
  if (NodeStateObservableWeakMap.has(node)) {
    const observables: INodeStateObservableInternal[] = (NodeStateObservableWeakMap.get(node) as INodeStateObservableInternal[]);
    for (let i = 0, l = observables.length; i < l; i++) {
      observables[i][NODE_STATE_OBSERVABLE_PRIVATE][name](event);
    }
  }
}

export function DispatchEventInSubTree(node: Node, name: TNodeStateObservableEventType): void {
  NodeStateObservableDispatchEvent(node, name);
  const treeWalker = document.createTreeWalker(node);
  while (treeWalker.nextNode()) {
    NodeStateObservableDispatchEvent(treeWalker.currentNode, name);
  }
}

export function GetOrCreateNodeStateObservable(node: Node): INodeStateObservable {
  if (NodeStateObservableWeakMap.has(node)) {
    return NodeStateObservableWeakMap.get(node)[0];
  } else {
    return new NodeStateObservable(node);
  }
}


export function NodeStateObservableOnAfterAttach(observable: INodeStateObservable): void {
  const preventable = new Preventable<'afterAttach'>();
  NotificationsObservableDispatch<INodeStateObservableKeyValueMap, 'afterAttach'>(observable, 'afterAttach', preventable);

  if (!preventable.isPrevented('afterAttach')) {
    if ((observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].referenceNode !== null) {
      (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].node.parentNode.insertBefore(
        (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].referenceNode,
        (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].node.nextSibling
      );
    }
  }
}

export function NodeStateObservableOnAfterDetach(observable: INodeStateObservable): void {
  const preventable = new Preventable<'afterDetach'>();
  NotificationsObservableDispatch<INodeStateObservableKeyValueMap, 'afterDetach'>(observable, 'afterDetach', preventable);

  if (!preventable.isPrevented('afterDetach')) {
    if ((observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].referenceNode !== null) {
      (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].referenceNode.parentNode.removeChild(
        (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].referenceNode
      );
    }
  }
}

export function NodeStateObservableSetReferenceNode(observable: INodeStateObservable, node: Node | null): void {
  const privates: INodeStateObservablePrivate = (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  if (node !== privates.referenceNode) {
    if ((privates.referenceNode !== null) && (privates.referenceNode.parentNode !== null)) {
      privates.referenceNode.parentNode.removeChild(privates.referenceNode);
    }

    if ((node !== null) && (privates.node.parentNode !== null)) {
      privates.node.parentNode.insertBefore(node, privates.node.nextSibling);
    }

    privates.referenceNode = node;
  }
}


export function NodeStateObservableActivateDOMObserver(observable: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  if (!privates.observer.activated) {
    if (privates.referenceNode === null) {
      NodeStateObservableSetReferenceNode(observable, privates.node.ownerDocument.createTextNode(''));
    }

    privates.observer.activate();
  }
}

export function NodeStateObservableDeactivateDOMObserver(observable: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  if (privates.observer.activated) {
    privates.observer.deactivate();

    if (!privates.useReferenceNode) {
      NodeStateObservableSetReferenceNode(observable, null);
    }
  }
}


export function NodeStateObservableUseDOMObserverUpdate(observable: INodeStateObservable): void {
  if (
    !(observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver
    && (((observable as unknown) as INodeStateObservableInternal)[OBSERVABLE_PRIVATE].observers.length === 0)
  ) {
    NodeStateObservableDeactivateDOMObserver(observable);
  } else if (
    (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver
    && (((observable as unknown) as INodeStateObservableInternal)[OBSERVABLE_PRIVATE].observers.length > 0)
  ) {
    NodeStateObservableActivateDOMObserver(observable);
  }
}




export function NodeStateObservableSetReferenceNodeManual(observable: INodeStateObservable, node: Node | null): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useReferenceNode = (node !== null);
  NodeStateObservableSetReferenceNode(observable, node);
}

export function NodeStateObservableUseDOMObserver<O extends INodeStateObservable>(observable: O, use: boolean): O {
  const privates: INodeStateObservablePrivate = ((observable as unknown) as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];
  if (use !== privates.useDOMObserver) {
    privates.useDOMObserver = use;
    NodeStateObservableUseDOMObserverUpdate(observable);
  }
  return observable;
}




export class NodeStateObservable extends NotificationsObservable<INodeStateObservableKeyValueMap> implements INodeStateObservable {

  static of(node: Node): INodeStateObservable {
    return GetOrCreateNodeStateObservable(node);
  }

  static useDOMObserver: boolean = false;

  constructor(node: Node) {
    super();
    ConstructNodeStateObservable(this, node);
    if (NodeStateObservable.useDOMObserver) {
      this.useDOMObserver(true);
    }
  }

  get state(): TNodeState {
    return ((this as unknown) as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].state;
  }

  get referenceNode(): Node | null {
    return ((this as unknown) as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].referenceNode;
  }

  set referenceNode(value: Node | null) {
    NodeStateObservableSetReferenceNodeManual(this, value);
  }

  useDOMObserver(use: boolean = true): this {
    return NodeStateObservableUseDOMObserver<this>(this, use);
  }
}

