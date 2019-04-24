import { INotificationsObservable, IPreventable } from '@lifaon/observables/public';

/**
 * TYPES
 */

export type TNodeStateObservableBeforeAttachPreventableType = 'attach' | 'afterAttach';
export type TNodeStateObservableBeforeDetachPreventableType = 'detach' | 'afterDetach';

export interface INodeStateObservableKeyValueMap {
  beforeAttach: IPreventable<TNodeStateObservableBeforeAttachPreventableType>;
  beforeDetach: IPreventable<TNodeStateObservableBeforeDetachPreventableType>;
  afterAttach: void;
  afterDetach: void;
  destroy: void;
  connect: void;
  disconnect: void;
}

export type TNodeState = 'connected' | 'disconnected' | 'destroyed';


/**
 * INTERFACES
 */

export interface INodeStateObservableConstructor {
  of(node: Node): INodeStateObservable;
  new(node: Node): INodeStateObservable;
}

// export interface INodeStateObservableConstructorProtected extends INodeStateObservableConstructor {
//   new(node: Node): INodeStateObservable;
// }


/**
 * Observes the node's state mutations and emits these changes
 */
export interface INodeStateObservable extends INotificationsObservable<INodeStateObservableKeyValueMap> {
  readonly state: TNodeState;
  useDOMObserver(use?: boolean): this;
}


