import { INavigation } from './interfaces';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { INavigationInternal, INavigationPrivate, NAVIGATION_PRIVATE } from './privates';
import { INotificationsObservableContext, ReadonlyList } from '@lifaon/observables';
import { INavigationKeyValueMap, INavigationOptions } from './types';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { INavigationState } from './state/interfaces';
import {
  NavigationHistoryInterceptor, NavigationHistoryManualDetectWithLog, NavigationHistoryUpdateLastLength
} from './functions';

let NAVIGATION_DEFINED: boolean = false;

/** CONSTRUCTOR **/

export function ConstructNavigation(
  instance: INavigation,
  context: INotificationsObservableContext<INavigationKeyValueMap>,
  options: INavigationOptions = {}
): void {
  if (NAVIGATION_DEFINED) {
    throw new Error(`Only one instance of Navigation may be created`);
  } else {
    NAVIGATION_DEFINED = true;
  }

  const enableManualDetect: boolean = false;
  ConstructClassWithPrivateMembers(instance, NAVIGATION_PRIVATE);
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];

  if (IsObject(options)) {
    privates.context = context;

    if (options.historyLimit === void 0) {
      options.historyLimit = -1;
    } else if (typeof options.historyLimit === 'number') {
      if (Number.isSafeInteger(options.historyLimit)) {
        privates.historyLimit = options.historyLimit;
      } else {
        throw new TypeError(`Expected an integer as options.historyLimit`);
      }
    } else {
      throw new TypeError(`Expected number as options.historyLimit`);
    }

    privates.history = [];
    privates.readonlyHistory = new ReadonlyList<INavigationState>(privates.history);
    privates.historyIndex = -1;

    NavigationHistoryUpdateLastLength();
    const clearInterceptors = NavigationHistoryInterceptor(instance);

    const onPopState = () => {
      NavigationHistoryManualDetectWithLog(instance);
    };
    window.addEventListener('popstate', onPopState);

    let timer: any;
    if (enableManualDetect) {
      timer = setInterval(() => {
        NavigationHistoryManualDetectWithLog(instance);
      }, 200);
    }

    privates.destroy = () => {
      clearInterceptors();
      window.removeEventListener('popstate', onPopState);

      if (enableManualDetect) {
        clearInterval(timer);
      }

      NAVIGATION_DEFINED = false;
    };
  } else {
    throw new TypeError(`Expected object as options`);
  }
}

export function IsNavigation(value: any): value is INavigation {
  return IsObject(value)
    && value.hasOwnProperty(NAVIGATION_PRIVATE as symbol);
}
