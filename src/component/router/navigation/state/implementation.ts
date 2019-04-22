import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { INavigationState, INavigationStateOptions } from './interfaces';

export const NAVIGATION_STATE_PRIVATE = Symbol('navigation-state-private');

export interface INavigationStatePrivate<TData> {
  url: string;
  timestamp: number;
  data: TData;
}

export interface INavigationStateInternal<TData> extends INavigationState<TData> {
  [NAVIGATION_STATE_PRIVATE]: INavigationStatePrivate<TData>;
}

export function ConstructNavigationState<TData>(
  navigationState: INavigationState<TData>,
  url: string,
  options: INavigationStateOptions<TData> = {}
): void {
  ConstructClassWithPrivateMembers(navigationState, NAVIGATION_STATE_PRIVATE);

  if (typeof url === 'string') {
    (navigationState as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].url = NormalizeURL(url);
  } else{
    throw new TypeError(`Expected string as url`);
  }

  if ((typeof options !== 'object') || (options === null)) {
    throw new TypeError(`Expected object or undefined as options`);
  }

  if (options.timestamp === void 0) {
    (navigationState as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].timestamp = Date.now();
  } else if (typeof options.timestamp === 'number') {
    (navigationState as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].timestamp = options.timestamp;
  } else{
    throw new TypeError(`Expected number as options.timestamp`);
  }

  (navigationState as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].data = Object.freeze(options.data);
}

export function NormalizeURL(url: string): string {
  return new URL(url, window.location.origin).href;
}

export class NavigationState<TData = any> implements INavigationState<TData> {
  constructor(url: string, options?: INavigationStateOptions<TData>) {
    ConstructNavigationState(this, url, options);
  }

  get url(): string {
    return ((this as unknown) as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].url;
  }


  get timestamp(): number {
    return ((this as unknown) as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].timestamp;
  }

  get data(): TData {
    return ((this as unknown) as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE].data;
  }

  equals(state: NavigationState<TData>): boolean {
    return (this.url === state.url);
  }

  toString(): string {
    return this.url;
  }
}