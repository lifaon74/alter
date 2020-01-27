import { INavigation } from './interfaces';
import { INavigationState } from './state/interfaces';
import { INavigationInternal, INavigationPrivate, NAVIGATION_PRIVATE } from './privates';
import { NavigationState } from './state/implementation';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { NormalizeURL } from './url-helpers';
import {
  INotificationsObservable, IObserver, IPipe, KeyValueMapToNotifications, mapNotificationsPipe
} from '@lifaon/observables';
import { INavigationKeyValueMap, INavigationNavigateKeyValueMap } from './types';
import { KeyValueMapKeys } from '@lifaon/observables/types/notifications/core/interfaces';


/** FUNCTIONS **/

const nativeHistory: History = window.history;
let nativeHistoryLastLength: number;

/* INTERCEPTORS */

export type TObjectMethodNames<TObject extends object> = {
  [TKey in keyof TObject]: TObject[TKey] extends (...args: any) => any
    ? TKey
    : never
}[keyof TObject];

/**
 * Intercepts calls on object[propertyName], by calling 'callback' instead
 *  - returns an undo function
 */
export function PropertyCallInterceptor<TObject extends object, TPropertyName extends TObjectMethodNames<TObject>>(
  object: TObject,
  propertyName: TPropertyName,
  callback: (args: Parameters<TObject[TPropertyName]>, object: TObject, native: TObject[TPropertyName]) => ReturnType<TObject[TPropertyName]>
): () => void {
  type TFunction = TObject[TPropertyName];
  const originalFunction: TFunction = object[propertyName];
  object[propertyName] = function (this: TObject, ...args: Parameters<TFunction>): ReturnType<TFunction> {
    return callback.call(this, args, object, originalFunction);
  } as TFunction;

  return () => {
    object[propertyName] = originalFunction;
  };
}


export function NavigationHistoryInterceptor(instance: INavigation): (() => void) {
  const interceptors: (() => void)[] = [];

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'pushState',
      (args: any[], target: History, native: History['pushState']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnPush(instance, CreateNavigationState(args[2]));
        NavigationHistoryUpdateLastLength();
        return result;
      })
  );

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'replaceState',
      (args: any[], target: History, native: History['replaceState']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnReplace(instance, CreateNavigationState(args[2]));
        NavigationHistoryUpdateLastLength();
        return result;
      })
  );

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'back',
      (args: any[], target: History, native: History['back']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnBack(instance);
        NavigationHistoryUpdateLastLength();
        return result;
      })
  );

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'forward',
      (args: any[], target: History, native: History['forward']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnForward(instance);
        NavigationHistoryUpdateLastLength();
        // return native.apply(target, args);
        return result;
      })
  );

  return () => {
    interceptors.forEach(_ => _());
  };
}


/* INTERCEPTED EVENTS */

export function NavigationHistoryOnPush(instance: INavigation, state: INavigationState): void {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];

  NavigationHistoryLog('push', state.url);

  // because of a previous back, it's possible we created a new branch, so we remove forwards
  const nextIndex: number = privates.historyIndex + 1;
  if (nextIndex !== privates.history.length) {
    privates.history.splice(nextIndex);
  }

  // we push current state into history
  privates.history.push(state);


  // if states' length if greater than limit, remove x first states
  if ((privates.historyLimit >= 0) && (privates.history.length > privates.historyLimit)) {
    privates.history.splice(0, privates.history.length - privates.historyLimit);
  }

  // historyIndex is updated
  privates.historyIndex = privates.history.length - 1;

  // send a 'push' event
  privates.context.dispatch('push', state);
}

export function NavigationHistoryOnRefresh(instance: INavigation, state: INavigationState): void {
  NavigationHistoryLog('refresh', state.url);
  (instance as INavigationInternal)[NAVIGATION_PRIVATE].context.dispatch('refresh', state);
}

export function NavigationHistoryOnReplace(instance: INavigation, state: INavigationState, integrityCheck: boolean = true): void {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];

  if (privates.historyIndex < 0) {
    NavigationHistoryOnPush(instance, state);
  } else {
    if (integrityCheck && (nativeHistory.length !== nativeHistoryLastLength)) {
      NavigationHistoryOnIntegrityError(instance, state, 'replace / history length diverge');
    } else {
      if (state.equals(privates.history[privates.historyIndex])) {
        NavigationHistoryOnRefresh(instance, state);
      } else {
        NavigationHistoryLog('replace');
        privates.history[privates.historyIndex] = state;
        privates.context.dispatch('replace', state);
      }
    }
  }
}

export function NavigationHistoryOnBack(instance: INavigation, state?: INavigationState, integrityCheck: boolean = true): void {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];

  const previousState: INavigationState | null = instance.getState(-1);
  if (state === void 0) {
    state = (previousState === null)
      ? CreateNavigationState(window.location.href)
      : previousState;
  }

  if (integrityCheck && (nativeHistory.length !== nativeHistoryLastLength)) {
    NavigationHistoryOnIntegrityError(instance, state, 'back / history length diverge');
  } else if (previousState === null) {
    NavigationHistoryOnIntegrityError(instance, state, 'back / no previous location');
  } else if (!state.equals(previousState)) {
    NavigationHistoryOnIntegrityError(instance, state, 'back / urls diverge');
  } else {
    privates.historyIndex = Math.max(privates.historyIndex - 1, -1);
    NavigationHistoryLog('back', state.url, privates.historyIndex);
    privates.context.dispatch('back', state);
  }
}

export function NavigationHistoryOnForward(instance: INavigation, state?: INavigationState, integrityCheck: boolean = true): void {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];

  const nextState: INavigationState | null = instance.getState(1);
  if (state === void 0) {
    state = (nextState === null)
      ? CreateNavigationState(window.location.href)
      : nextState;
  }

  if (integrityCheck && (nativeHistory.length !== nativeHistoryLastLength)) {
    NavigationHistoryOnIntegrityError(instance, state, 'forward / history length diverge');
  } else if (nextState === null) {
    NavigationHistoryOnIntegrityError(instance, state, 'forward / no forward location');
  } else if (!state.equals(nextState)) {
    NavigationHistoryOnIntegrityError(instance, state, 'forward / urls diverge');
  } else {
    NavigationHistoryLog('forward', state.url.toString());
    privates.historyIndex = Math.min(privates.historyIndex + 1, privates.history.length - 1);
    privates.context.dispatch('forward', state);
  }
}


/* LOG AND ERRORS */

export function NavigationHistoryOnIntegrityError(instance: INavigation, state: INavigationState, message: string = ''): void {
  console.warn(`IntegrityError on navigation : ${ message }`);
  // debugger;
  (instance as INavigationInternal)[NAVIGATION_PRIVATE].context.dispatch('error', state);
  instance.resetHistory();
}

export function NavigationHistoryLog(...args: any[]): void {
  console.info.apply(console, ['[INFO]:', ...args]);
}


/* MANUAL DETECTION */

export function CompareNavigationStateWithHistoryState(
  instanceState: any,
  historyState: any = nativeHistory.state
): boolean {
  return (
    IsObject<{ id: number }>(instanceState)
    && IsObject<{ id: number }>(historyState)
    && (instanceState.id === historyState.id)
  );
}

export function NavigationHistoryManualDetect(instance: INavigation, replaceTimeout: number = 100): boolean {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];

  const url: string = NormalizeURL(window.location.href);
  if (privates.historyIndex < 0) {
    NavigationHistoryOnPush(instance, CreateNavigationState(url));
    NavigationHistoryUpdateLastLength();
    return true;
  } else {
    if (url !== privates.history[privates.historyIndex].url) {
      if (url === privates.history[privates.historyIndex].url) {
        NavigationHistoryOnReplace(instance, CreateNavigationState(url), false);
        return true;
      } else if (
        ((privates.historyIndex > 0)
          && (url === privates.history[privates.historyIndex - 1].url))
        && CompareNavigationStateWithHistoryState(privates.history[privates.historyIndex - 1].data, nativeHistory.state)
        // && (nativeHistory.length === nativeHistoryLastLength)
      ) { // detect a back
        NavigationHistoryOnBack(instance, void 0, false);
        return true;
      } else if (
        (privates.historyIndex + 1 < privates.history.length)
        && (url === privates.history[privates.historyIndex + 1].url)
        && CompareNavigationStateWithHistoryState(privates.history[privates.historyIndex + 1].data, nativeHistory.state)
        // && (nativeHistory.length === nativeHistoryLastLength)
      ) { // detect a forward
        NavigationHistoryOnForward(instance, void 0, false);
        return true;
      } else {
        if ((Date.now() - privates.history[privates.historyIndex].timestamp) < replaceTimeout) { // consider update less than 100ms as replace
          NavigationHistoryOnReplace(instance, CreateNavigationState(url), false);
        } else {
          NavigationHistoryOnPush(instance, CreateNavigationState(url));
        }
        return true;
      }
    } else {
      return false;
    }
  }
}

export function NavigationHistoryManualDetectWithLog(instance: INavigation, replaceTimeout?: number): void {
  if (NavigationHistoryManualDetect(instance, replaceTimeout)) {
    NavigationHistoryLog('navigation detected manually');
  }
}

/* OTHERS */

export function CreateNavigationState(url: string): INavigationState {
  return new NavigationState({
    url,
    data: nativeHistory.state
  });
}

export function NavigationHistoryUpdateLastLength(): void {
  nativeHistoryLastLength = nativeHistory.length;
}


/**
 * Waits until popState detected or until timeout
 */
export function NavigationHistoryUntilPopState(resolve: () => void, timeout: number = 200): void {
  const clear = () => {
    window.removeEventListener('popstate', onPopState);
    window.clearTimeout(timer);
  };

  const onPopState = () => {
    clear();
    resolve();
  };

  window.addEventListener('popstate', onPopState);

  const onTimeout = () => {
    clear();
    resolve();
  };

  const timer = window.setTimeout(onTimeout, timeout);
}

/**
 * Creates a Pipe which emits a 'navigate' notification when a INavigationKeyValueMap's Notification is received
 */
export function NavigationPipe(): IPipe<IObserver<KeyValueMapToNotifications<INavigationKeyValueMap>>, INotificationsObservable<INavigationNavigateKeyValueMap>> {
  return mapNotificationsPipe<INavigationKeyValueMap, 'navigate'>(['back', 'forward', 'push', 'refresh', 'replace'] as KeyValueMapKeys<INavigationKeyValueMap>[], 'navigate');
}
