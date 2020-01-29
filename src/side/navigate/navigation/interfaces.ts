import { INavigationState } from './state/interfaces';
import { INotificationsObservable, INotificationsObserver, IReadonlyList } from '@lifaon/observables';
import {
  INavigationExtendedKeyValueMap, INavigationKeyValueMap, INavigationNavigateOptions, INavigationOptions
} from './types';


/** INTERFACES **/

export interface INavigationStatic {
  create(options?: INavigationOptions): INavigation;
}

/* PRIVATE */
export interface INavigationConstructor extends INavigationStatic {
  new(options?: INavigationOptions): INavigation;
}

/**
 * Allows to navigate on an application by changing the URL
 */
export interface INavigation extends INotificationsObservable<INavigationKeyValueMap> {
  // list of navigation states explored
  readonly history: IReadonlyList<INavigationState<any>>;
  // current index on the history
  readonly historyIndex: number;
  // current page URL
  readonly currentURL: URL;

  /**
   * Returns a NavigationState relative to the current NavigationState
   */
  getState(index?: number): INavigationState<any> | null;

  /**
   * Changes the URL
   */
  navigate(url: string | URL, options?: INavigationNavigateOptions): Promise<void>;

  back(): Promise<void>;

  canBack(): boolean;

  forward(): Promise<void>;

  canForward(): boolean;

  /**
   * Calls navigate with replaceState: false
   */
  push(url: string | URL): Promise<void>;


  /**
   * Calls navigate with replaceState: true
   */
  replace(url: string | URL): Promise<void>;

  /**
   * Calls navigate with current's url and replaceState: true
   */
  refresh(): Promise<void>;

  resetHistory(): void;

  addListener<K extends keyof INavigationExtendedKeyValueMap>(name: K, callback: (value: INavigationExtendedKeyValueMap[K]) => void): INotificationsObserver<K, INavigationExtendedKeyValueMap[K]>;
}

