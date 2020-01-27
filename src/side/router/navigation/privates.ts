import { INotificationsObservableContext, IReadonlyList } from '@lifaon/observables';
import { INavigationKeyValueMap } from './types';
import { INavigationState } from './state/interfaces';
import { INavigation } from './interfaces';

/** PRIVATES **/

export const NAVIGATION_PRIVATE = Symbol('navigation-private');

export interface INavigationPrivate {
  context: INotificationsObservableContext<INavigationKeyValueMap>;
  historyLimit: number;
  history: INavigationState[];
  readonlyHistory: IReadonlyList<INavigationState>;
  historyIndex: number;

  destroy(): void;
}

export interface INavigationPrivatesInternal {
  [NAVIGATION_PRIVATE]: INavigationPrivate;
}

export interface INavigationInternal extends INavigationPrivatesInternal, INavigation {
}
