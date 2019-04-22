import { INotificationsObservable, IPreventable } from '@lifaon/observables/public';

// export type TNodeStateObservableNotificationName = 'beforeAttach' | 'beforeDetach' | 'afterAttach' | 'afterDetach' | 'destroy' | 'connect' | 'disconnect';
export type TNodeStateObservablePreventableType = 'attach' | 'detach' | 'afterAttach' | 'afterDetach';
// export type TNodeStateObservableNotificationType = IPreventable<TNodeStateObservablePreventableType> | undefined;

export interface INodeStateObservableKeyValueMap {
  beforeAttach: IPreventable<TNodeStateObservablePreventableType>;
  beforeDetach: IPreventable<TNodeStateObservablePreventableType>;
  afterAttach: IPreventable<TNodeStateObservablePreventableType>;
  afterDetach: IPreventable<TNodeStateObservablePreventableType>;
  destroy: undefined;
  connect: undefined;
  disconnect: undefined;
}

export interface INodeStateObservableConstructor {
  for(node: Node): INodeStateObservable;

  new(node: Node): INodeStateObservable;
}

export interface INodeStateObservable extends INotificationsObservable<INodeStateObservableKeyValueMap> {
  readonly state: TNodeState;
  referenceNode: Node | null;
  useDOMObserver(use?: boolean): this;
}

export type TNodeState = 'connected' | 'disconnected' | 'destroyed';
