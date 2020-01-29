import { INavigationState } from './state/interfaces';

/** TYPES **/

export interface INavigationKeyValueMap {
  push: INavigationState;
  refresh: INavigationState;
  replace: INavigationState;
  error: INavigationState;
  back: INavigationState;
  forward: INavigationState;
}

export interface INavigationOptions {
  historyLimit?: number;
}

export interface INavigationNavigateKeyValueMap {
  navigate: INavigationState;
}

export interface INavigationExtendedKeyValueMap extends INavigationKeyValueMap, INavigationNavigateKeyValueMap {
}

export interface INavigationNavigateOptions {
  replaceState?: boolean; // (default: false)
}
