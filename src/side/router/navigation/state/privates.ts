import { INavigationState } from './interfaces';

/** PRIVATES **/

export const NAVIGATION_STATE_PRIVATE = Symbol('navigation-state-private');

export interface INavigationStatePrivate<TData> {
  url: string;
  timestamp: number;
  data: TData;
}

export interface INavigationStatePrivatesInternal<TData> {
  [NAVIGATION_STATE_PRIVATE]: INavigationStatePrivate<TData>;
}

export interface INavigationStateInternal<TData> extends INavigationState<TData>, INavigationStatePrivatesInternal<TData> {
}
