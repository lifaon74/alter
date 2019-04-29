import { INavigationState } from './state/interfaces';
import { INavigation, INavigationExtendedKeyValueMap, INavigationKeyValueMap, INavigationNavigateKeyValueMap, INavigationNavigateOptions } from './interfaces';
import { NavigationState, NormalizeURL } from './state/implementation';
import { INotification, INotificationsObservable, INotificationsObservableContext, INotificationsObserver, IObserver, IPipe, IReadonlyList, KeyValueMapKeys, KeyValueMapToNotifications, NotificationsObservable, ReadonlyList } from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { PropertyCallInterceptor } from '@lifaon/observables/classes/properties';
import { IsObject } from '../../../helpers';
import { mapNotificationNames } from '@lifaon/observables/operators/aggregateNotificationNames';




const NAVIGATION_PRIVATE = Symbol('navigation-private');

interface INavigationPrivate {
  context: INotificationsObservableContext<INavigationKeyValueMap>;
  historyLimit: number;
  history: INavigationState[];
  readonlyHistory: IReadonlyList<INavigationState>;
  historyIndex: number;
  destroy(): void;
}

interface INavigationInternal extends INavigation {
  [NAVIGATION_PRIVATE]: INavigationPrivate;
}

const nativeHistory: History = window.history;
let nativeHistoryLastLength: number;
let pendingNavigation: Promise<void> = Promise.resolve();


function ConstructNavigation(navigation: INavigation, context: INotificationsObservableContext<INavigationKeyValueMap>, historyLimit: number = -1): void {
  const enableManualDetect: boolean = false;
  ConstructClassWithPrivateMembers(navigation, NAVIGATION_PRIVATE);

  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].context = context;

  if (typeof historyLimit === 'number') {
    if (Number.isNaN(historyLimit)) {
      throw new TypeError(`Expected a real number as historyLimit, found NaN`);
    } else {
      (navigation as INavigationInternal)[NAVIGATION_PRIVATE].historyLimit = historyLimit;
    }
  } else {
    throw new TypeError(`Expected number as historyLimit`);
  }

  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].history = [];
  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].readonlyHistory = new ReadonlyList<INavigationState>((navigation as INavigationInternal)[NAVIGATION_PRIVATE].history);
  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex = -1;

  NavigationHistoryUpdateLastLength();
  const clearInterceptors = NavigationHistoryInterceptor(navigation);

  const onPopState = () => {
    NavigationHistoryManualDetect(navigation);
  };
  window.addEventListener('popstate', onPopState);

  let timer: any;
  if (enableManualDetect) {
    timer = setInterval(() => {
      NavigationHistoryManualDetect(navigation);
    }, 200);
  }

  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].destroy = () => {
    clearInterceptors();
    window.removeEventListener('popstate', onPopState);

    if (enableManualDetect) {
      clearInterval(timer);
    }
  };
}





function NavigationHistoryInterceptor(navigation: INavigation): (() => void) {
  const interceptors: (() => void)[] = [];

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'pushState',
      (args: any[], target: History, native: History['pushState']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnPush(navigation, CreateNavigationState(args[2]));
        NavigationHistoryUpdateLastLength();
        return result;
      })
  );

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'replaceState',
      (args: any[], target: History, native: History['replaceState']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnReplace(navigation, CreateNavigationState(args[2]));
        NavigationHistoryUpdateLastLength();
        return result;
      })
  );

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'back',
      (args: any[], target: History, native: History['back']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnBack(navigation);
        NavigationHistoryUpdateLastLength();
        return result;
      })
  );

  interceptors.push(
    PropertyCallInterceptor(nativeHistory, 'forward',
      (args: any[], target: History, native: History['forward']) => {
        const result: any = native.apply(target, args);
        NavigationHistoryOnForward(navigation);
        NavigationHistoryUpdateLastLength();
        // return native.apply(target, args);
        return result;
      })
  );

  return () => {
    interceptors.forEach(_ => _());
  };
}

function CreateNavigationState(url: string): INavigationState {
  return new NavigationState(url, { data: nativeHistory.state });
}

function CompareNavigationStateWithHistoryState(navigationState: any, historyState: any = nativeHistory.state): boolean {
  return (
    IsObject<{ id: number }>(navigationState)
    && IsObject<{ id: number }>(historyState)
    && (navigationState.id === historyState.id)
  );
}


function NavigationHistoryOnPush(navigation: INavigation, state: INavigationState): void {
  const privates: INavigationPrivate = (navigation as INavigationInternal)[NAVIGATION_PRIVATE];

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

function NavigationHistoryOnRefresh(navigation: INavigation, state: INavigationState): void {
  NavigationHistoryLog('refresh', state.url);
  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].context.dispatch('refresh', state);
}

function NavigationHistoryOnReplace(navigation: INavigation, state: INavigationState, integrityCheck: boolean = true): void {
  const privates: INavigationPrivate = (navigation as INavigationInternal)[NAVIGATION_PRIVATE];

  if (privates.historyIndex < 0) {
    NavigationHistoryOnPush(navigation, state);
  } else {
    if (integrityCheck && (nativeHistory.length !== nativeHistoryLastLength)) {
      NavigationHistoryOnIntegrityError(navigation, state, 'replace / history length diverge');
    } else {
      if (state.equals(privates.history[privates.historyIndex])) {
        NavigationHistoryOnRefresh(navigation, state);
      } else {
        NavigationHistoryLog('replace');
        privates.history[privates.historyIndex] = state;
        privates.context.dispatch('replace', state);
      }
    }
  }
}

function NavigationHistoryOnBack(navigation: INavigation, state?: INavigationState, integrityCheck: boolean = true): void {
  const privates: INavigationPrivate = (navigation as INavigationInternal)[NAVIGATION_PRIVATE];

  const previousState: INavigationState | null = NavigationHistoryGet(navigation, -1);
  if (state === void 0) {
    state = previousState;
  }

  if (integrityCheck && (nativeHistory.length !== nativeHistoryLastLength)) {
    NavigationHistoryOnIntegrityError(navigation, state, 'back / history length diverge');
  } else if (previousState === null) {
    NavigationHistoryOnIntegrityError(navigation, state, 'back / no previous location');
  } else if (!state.equals(previousState)) {
    NavigationHistoryOnIntegrityError(navigation, state, 'back / urls diverge');
  } else {
    privates.historyIndex = Math.max(privates.historyIndex - 1, -1);
    NavigationHistoryLog('back', state.url, privates.historyIndex);
    privates.context.dispatch('back', state);
  }
}

function NavigationHistoryOnForward(navigation: INavigation, state?: INavigationState, integrityCheck: boolean = true): void {
  const privates: INavigationPrivate = (navigation as INavigationInternal)[NAVIGATION_PRIVATE];

  const nextState: INavigationState | null = NavigationHistoryGet(navigation, 1);
  if (state === void 0) {
    state = nextState;
  }

  if (integrityCheck && (nativeHistory.length !== nativeHistoryLastLength)) {
    NavigationHistoryOnIntegrityError(navigation, state, 'forward / history length diverge');
  } else if (nextState === null) {
    NavigationHistoryOnIntegrityError(navigation, state, 'forward / no forward location');
  } else if (!state.equals(nextState)) {
    NavigationHistoryOnIntegrityError(navigation, state, 'forward / urls diverge');
  } else {
    NavigationHistoryLog('forward', state.url.toString());
    privates.historyIndex = Math.min(privates.historyIndex + 1, privates.history.length - 1);
    privates.context.dispatch('forward', state);
  }
}


function NavigationHistoryManualDetect(navigation: INavigation, replaceTimeout: number = 100): boolean {
  const privates: INavigationPrivate = (navigation as INavigationInternal)[NAVIGATION_PRIVATE];

  const url: string = NormalizeURL(window.location.href);
  if (privates.historyIndex < 0) {
    NavigationHistoryOnPush(navigation, CreateNavigationState(url));
    NavigationHistoryUpdateLastLength();
    return true;
  } else {
    if (url !== privates.history[privates.historyIndex].url) {
      if (url === privates.history[privates.historyIndex].url) {
        NavigationHistoryOnReplace(navigation, CreateNavigationState(url), false);
        return true;
      } else if (
        ((privates.historyIndex > 0)
        && (url === privates.history[privates.historyIndex - 1].url))
        && CompareNavigationStateWithHistoryState(privates.history[privates.historyIndex - 1].data, nativeHistory.state)
      // && (nativeHistory.length === nativeHistoryLastLength)
      ) { // detect a back
        NavigationHistoryOnBack(navigation, void 0, false);
        return true;
      } else if (
        (privates.historyIndex + 1 < privates.history.length)
        && (url === privates.history[privates.historyIndex + 1].url)
        && CompareNavigationStateWithHistoryState(privates.history[privates.historyIndex + 1].data, nativeHistory.state)
        // && (nativeHistory.length === nativeHistoryLastLength)
      ) { // detect a forward
        NavigationHistoryOnForward(navigation, void 0, false);
        return true;
      } else {
        if ((Date.now() - privates.history[privates.historyIndex].timestamp) < replaceTimeout) { // consider update less than 100ms as replace
          NavigationHistoryOnReplace(navigation, CreateNavigationState(url), false);
        } else {
          NavigationHistoryOnPush(navigation, CreateNavigationState(url));
        }
        return true;
      }
    } else {
      return false;
    }
  }
}


function NavigationHistoryUpdateLastLength(): void {
  nativeHistoryLastLength = nativeHistory.length;
}

function NavigationHistoryOnIntegrityError(navigation: INavigation, state: INavigationState, message: string = ''): void {
  console.warn(`IntegrityError : ${message}`);
  // debugger;
  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].context.dispatch('error', state);
  NavigationHistoryReset(navigation);
}

function NavigationHistoryLog(...args: any[]): void {
  // console.info.apply(console, ['[INFO]:', ...args]);
}

/**
 * Waits until popState detected or until timeout
 * @param resolve
 * @param timeout
 */
function NavigationHistoryUntilPopState(resolve: () => void, timeout: number = 200): void {
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




function NavigationHistoryGet(navigation: INavigation, index: number): INavigationState | null {
  const historyIndex: number = (navigation as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex + index;
  return ((0 <= historyIndex) && (historyIndex < (navigation as INavigationInternal)[NAVIGATION_PRIVATE].history.length))
    ? (navigation as INavigationInternal)[NAVIGATION_PRIVATE].history[historyIndex]
    : null;
}

function NavigationHistoryReset(navigation: INavigation): void {
  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].history = [];
  (navigation as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex = -1;
}


export function NavigationNavigate(url: string | URL, options: INavigationNavigateOptions = {}): Promise<void> {
  return pendingNavigation = pendingNavigation
    .then(() => {

      if (url instanceof URL) {
        url = url.href;
      } else if (typeof url !== 'string') {
        throw new TypeError(`Expected URL or string as url`);
      }

      const data: any = {
        id: Date.now().toString(16) + '-' + Math.floor(Math.random() * 1e15).toString(16)
      };
      if (options.replaceState) {
        window.history.replaceState(data, '', url);
      } else {
        window.history.pushState(data, '', url);
      }
    });
}

/**
 * back and forward are in reality async
 *  nav.go('hello1');
 *  nav.go('hello2');
 *  nav.back();
 *  nav.go('hello3');
 *  // the url will be 'hello1' because back is in reality executed after 'hello3'
 */
export function NavigationBack(): Promise<void> {
  return pendingNavigation = pendingNavigation
    .then(() => {
      return new Promise<void>((resolve: any) => {
        NavigationHistoryUntilPopState(resolve);
        window.history.back();
      });
    });
}

export function NavigationForward(): Promise<void> {
  return pendingNavigation = pendingNavigation
    .then(() => {
      return new Promise<void>((resolve: any) => {
        NavigationHistoryUntilPopState(resolve);
        window.history.forward();
      });
    });
}


export function navigationPipe(): IPipe<IObserver<KeyValueMapToNotifications<INavigationKeyValueMap>>, INotificationsObservable<INavigationNavigateKeyValueMap>> {
  return mapNotificationNames<INavigationKeyValueMap, 'navigate'>(['back', 'forward', 'push', 'refresh', 'replace'], 'navigate');
}


class Navigation extends NotificationsObservable<INavigationKeyValueMap> implements INavigation {

  constructor(historyLimit: number = -1) {
    let context: INotificationsObservableContext<INavigationKeyValueMap> = void 0;
    super((_context: INotificationsObservableContext<INavigationKeyValueMap>) => {
      context = _context;
    });
    ConstructNavigation(this, context, historyLimit);
  }

  get history(): IReadonlyList<INavigationState> {
    return ((this as unknown) as INavigationInternal)[NAVIGATION_PRIVATE].readonlyHistory;
  }

  get historyIndex(): number {
    return ((this as unknown) as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex;
  }

  get currentURL(): URL {
    return new URL(window.location.href);
  }

  get(index?: number): INavigationState | null {
    return NavigationHistoryGet(this, index);
  }

  navigate(url: string | URL, options?: INavigationNavigateOptions): Promise<void> {
    return NavigationNavigate(url, options);
  }

  back(): Promise<void> {
    return NavigationBack();
  }

  canBack(): boolean {
    return (((this as unknown) as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex > 0);
  }

  forward(): Promise<void> {
    return NavigationForward();
  }

  canForward(): boolean {
    return ((((this as unknown) as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex + 1) < ((this as unknown) as INavigationInternal)[NAVIGATION_PRIVATE].history.length);
  }


  push(url: string | URL): Promise<void> {
    return NavigationNavigate(url, { replaceState: false });
  }

  replace(url: string | URL): Promise<void> {
    return NavigationNavigate(url, { replaceState: true });
  }

  refresh(): Promise<void> {
    return NavigationNavigate(window.location.href, { replaceState: true });
  }


  resetHistory(): void {
    NavigationHistoryReset(this);
  }


  addListener<K extends keyof INavigationExtendedKeyValueMap>(name: K, callback: (value: INavigationExtendedKeyValueMap[K]) => void): INotificationsObserver<K, INavigationExtendedKeyValueMap[K]> {
    if (name === 'navigate') {
      return this.pipeThrough(navigationPipe())
        .addListener('navigate', callback as (value: INavigationState) => void) as any;
    } else {
      return super.addListener<any>(name as any, callback as (value: INavigationState) => void);
    }
  }


  debug(): string {
    return ((this as unknown) as INavigationInternal)[NAVIGATION_PRIVATE].history.map((url, index) => ('-' + ((index === ((this as unknown) as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex) ? '> ' : '  ') + url.toString())).join('\n');
  }

}

// navigation is uniq
export const navigation: INavigation = new Navigation(100);




export async function testNavigation() {
  console.log(Array.from(navigation.history));
  (window as any).nav = navigation;
  window.onpopstate = () => {
    console.log('popstate');
  };

  console.log(nativeHistory.length, nativeHistoryLastLength);
  navigation.navigate('hello1');
  navigation.navigate('hello2');
  navigation.back();
  navigation.forward();
  // nav.navigate('hello3', true);
  // nav.navigate('hello1');
  // await nav.back();
  // await nav.forward();
  navigation.navigate('hello3');
  console.log(window.location.href);
}



