import { OnConnected, OnCreate, OnDestroy, OnDisconnected, OnInit } from './implements';

/** INTERFACES **/

export interface IComponentTypedConstructor<TData extends object> {
  new(): IComponent<TData>;
}

export interface IComponent<TData extends object> extends HTMLElement, Partial<OnCreate<TData>>, Partial<OnInit>, Partial<OnDestroy>, Partial<OnConnected>, Partial<OnDisconnected> {
}

