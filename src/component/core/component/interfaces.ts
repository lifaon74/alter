import { ICustomElementOptions } from '../custom-element/implementation';
import { ITemplate } from '../../../template/interfaces';
import { IStyle } from '../../../style/interfaces';
import { INotificationsObservable } from '@lifaon/observables/public';
import { IHostBinding } from '../host-binding/interfaces';


export interface IComponent extends HTMLElement {
  // readonly data: any;
  readonly onCreate?: (context: IComponentContext) => void;
  readonly onInit?: () => void;
  readonly onDestroy?: () => void;
  readonly onConnected?: () => void;
  readonly onDisconnected?: () => void;
}

export interface IComponentOptions extends ICustomElementOptions {
  template?: Promise<ITemplate> | ITemplate;
  style?: Promise<IStyle> | IStyle;
  host?: IHostBinding[];
}

export interface OnCreate {
  onCreate(context: IComponentContext): void;
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


export interface IComponentContext {
  readonly data: any;
  readonly attributeListener: INotificationsObservable<IComponentContextAttributeListenerKeyValueMap>;
}

export interface IComponentContextAttributeListenerKeyValueMap {
  [key: string]: IAttributeChange<any>;
}

export interface IAttributeChange<T> {
  previous: T;
  current: T;
}
