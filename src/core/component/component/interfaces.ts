import { INotificationsObservable, TPromiseOrValue } from '@lifaon/observables';
import { IHostBinding } from '../host-binding/interfaces';
import { ICustomElementOptions } from '../custom-element/functions';
import { ITemplate } from '../../template/interfaces';

export type TComponentDataGeneric = { [key: string]: any };

/** INTERFACES **/

export interface IComponent<T extends object> extends HTMLElement, Partial<OnCreate<T>>, Partial<OnInit>, Partial<OnDestroy>, Partial<OnConnected>, Partial<OnDisconnected> {
}

export interface IComponentOptions extends ICustomElementOptions {
  template?: TPromiseOrValue<ITemplate>;
  style?: TPromiseOrValue<IStyle>;
  host?: IHostBinding[];
}

/** IMPLEMENTS **/

export interface OnCreate<T extends object> {
  onCreate(context: IComponentContext<T>): void;
}

export interface OnInit {
  onInit(): void;
}

export interface OnDestroy {
  onDestroy(): void;
}

export interface OnConnected {
  onConnected(): void;
}

export interface OnDisconnected {
  onDisconnected(): void;
}


/*---------------------------*/


export interface IComponentContext<T extends object> {
  data: T;
  readonly frozen: boolean;
  readonly attributeListener: INotificationsObservable<IComponentContextAttributeListenerKeyValueMap>;
}

export interface IComponentContextAttributeListenerKeyValueMap {
  [key: string]: IAttributeChange<any>;
}

export interface IAttributeChange<T> {
  previous: T;
  current: T;
}
