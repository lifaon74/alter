import { INavigationState } from './state/interfaces';
import { IReadonlyList } from '../../../../misc/readonly-list/interfaces';
import { INotificationsObservable } from '../../../../notifications/core/notifications-observable/interfaces';
import { INotificationsObserver } from '../../../../notifications/core/notifications-observer/interfaces';

// export type TNavigationEvents = 'push' | 'refresh' | 'replace' | 'error' | 'back' | 'forward';

export interface INavigationKeyValueMap {
  push: INavigationState;
  refresh: INavigationState;
  replace: INavigationState;
  error: INavigationState;
  back: INavigationState;
  forward: INavigationState;
}

export interface INavigationNavigateKeyValueMap {
  navigate: INavigationState;
}


export interface INavigationExtendedKeyValueMap extends INavigationKeyValueMap, INavigationNavigateKeyValueMap {
}

export interface INavigationNavigateOptions {
  replaceState?: boolean;
}


export interface INavigation extends INotificationsObservable<INavigationKeyValueMap> {
  readonly history: IReadonlyList<INavigationState<any>>;
  readonly historyIndex: number;
  readonly currentURL: URL;

  get(index?: number): INavigationState<any> | null;
  navigate(url: string | URL, options?: INavigationNavigateOptions): Promise<void>;

  back(): Promise<void>;
  canBack(): boolean;
  forward(): Promise<void>;
  canForward(): boolean;

  resetHistory(): void;

  addListener<K extends keyof INavigationExtendedKeyValueMap>(name: K, callback: (value: INavigationExtendedKeyValueMap[K]) => void): INotificationsObserver<INavigationExtendedKeyValueMap>;
}

