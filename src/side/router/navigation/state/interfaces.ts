import { INavigationStateOptions } from './types';

/** INTERFACES **/

export interface INavigationStateConstructor {
  new<TData>(options: INavigationStateOptions<TData>): INavigationState<TData>;
}

/**
 * Represents a fixed state of a navigation (when the url changes)
 */
export interface INavigationState<TData = any> extends INavigationStateOptions<TData> {
  readonly url: string;
  readonly timestamp: number;
  readonly data: TData;

  equals(state: INavigationState<TData>): boolean
}
