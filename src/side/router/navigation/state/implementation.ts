import { INavigationState} from './interfaces';
import { INavigationStateInternal, NAVIGATION_STATE_PRIVATE } from './privates';
import { ConstructNavigationState } from './constructor';
import { INavigationStateOptions } from './types';

/** METHODS **/

/* GETTERS/SETTERS */

export function NavigationStateGetURL<TData>(instance: INavigationState<TData>,): string {
  return (instance as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].url;
}

export function NavigationStateGetTimeStamp<TData>(instance: INavigationState<TData>,): number {
  return (instance as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].timestamp;
}

export function NavigationStateGetData<TData>(instance: INavigationState<TData>,): TData {
  return (instance as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].data;
}

/* METHODS */

export function NavigationStateEquals<TData>(instance: INavigationState<TData>, state: INavigationState<TData>): boolean {
  return (instance.url === state.url);
}

export function NavigationStateToString<TData>(instance: INavigationState<TData>): string {
  return instance.url;
}

/** CLASS **/

export class NavigationState<TData = any> implements INavigationState<TData> {
  constructor(options: INavigationStateOptions<TData>) {
    ConstructNavigationState<TData>(this, options);
  }

  get url(): string {
    return NavigationStateGetURL<TData>(this);
  }

  get timestamp(): number {
    return NavigationStateGetTimeStamp<TData>(this);
  }

  get data(): TData {
    return NavigationStateGetData<TData>(this);
  }

  equals(state: INavigationState<TData>): boolean {
    return NavigationStateEquals<TData>(this, state);
  }

  toString(): string {
    return NavigationStateToString<TData>(this);
  }
}
