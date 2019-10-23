import { ICustomElementOptions } from '../custom-element/implementation';
import { ITemplate } from '../../../template/interfaces';
import { IStyle } from '../../../style/interfaces';
import { INotificationsObservable, TPromiseOrValue } from '@lifaon/observables';
import { IHostBinding } from '../host-binding/interfaces';

export type TComponentDataGeneric = { [key: string]: any };

export interface IComponent<T extends object> extends HTMLElement, Partial<OnCreate<T>>, Partial<OnInit>, Partial<OnDestroy>, Partial<OnConnected>, Partial<OnDisconnected> {
  // readonly data: any;
  // readonly onCreate?: (context: IComponentContext<T>) => void;
  // readonly onInit?: () => void;
  // readonly onDestroy?: () => void;
  // readonly onConnected?: () => void;
  // readonly onDisconnected?: () => void;
}

export interface IComponentOptions extends ICustomElementOptions {
  template?: TPromiseOrValue<ITemplate>;
  style?: TPromiseOrValue<IStyle>;
  host?: IHostBinding[];
}

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
