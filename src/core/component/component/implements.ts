import { IComponentContext } from './context/interfaces';

/** IMPLEMENTS **/

export interface OnCreate<TData extends object> {
  onCreate(context: IComponentContext<TData>): void;
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
