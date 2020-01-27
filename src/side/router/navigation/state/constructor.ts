import { INavigationState} from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { INavigationStateInternal, INavigationStatePrivate, NAVIGATION_STATE_PRIVATE } from './privates';
import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { CloneURL, NormalizeURL } from '../url-helpers';
import { INavigationStateOptions } from './types';

/** CONSTRUCTOR **/

export function ConstructNavigationState<TData>(
  instance: INavigationState<TData>,
  options: INavigationStateOptions<TData>
): void {
  ConstructClassWithPrivateMembers(instance, NAVIGATION_STATE_PRIVATE);
  const privates: INavigationStatePrivate<TData> = (instance as INavigationStateInternal<TData>)[NAVIGATION_STATE_PRIVATE];

  if (IsObject(options)) {
    if (typeof options.url === 'string') {
      privates.url = NormalizeURL(options.url);
    } else if (options.url instanceof URL) {
      privates.url = options.url.href;
    } else {
      throw new TypeError(`Expected string as options.url`);
    }

    if (options.timestamp === void 0) {
      privates.timestamp = Date.now();
    } else if (typeof options.timestamp === 'number') {
      privates.timestamp = options.timestamp;
    } else {
      throw new TypeError(`Expected number as options.timestamp`);
    }

    privates.data = Object.freeze(options.data) as TData;
  } else {
    throw new TypeError(`Expected object as options`);
  }
}

export function IsNavigationState(value: any): value is INavigationState<any> {
  return IsObject(value)
    && value.hasOwnProperty(NAVIGATION_STATE_PRIVATE as symbol);
}
