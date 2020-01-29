import { INavigationState } from './state/interfaces';
import { INavigation } from './interfaces';
import {
  INotificationsObservableContext, INotificationsObserver, IReadonlyList, NotificationsObservable
} from '@lifaon/observables';
import {
  INavigationExtendedKeyValueMap, INavigationKeyValueMap, INavigationNavigateOptions, INavigationOptions
} from './types';
import { INavigationInternal, INavigationPrivate, NAVIGATION_PRIVATE } from './privates';
import { NavigationHistoryUntilPopState, NavigationPipe } from './functions';
import { uuid } from '../../../misc/helpers/uuid';
import { ConstructNavigation } from './constructor';


let pendingNavigation: Promise<void> = Promise.resolve();

/** METHODS **/

/* GETTERS/SETTERS */

export function NavigationGetHistory(instance: INavigation): IReadonlyList<INavigationState> {
  return (instance as INavigationInternal)[NAVIGATION_PRIVATE].readonlyHistory;
}

export function NavigationGetHistoryIndex(instance: INavigation): number {
  return (instance as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex;
}

export function NavigationGetCurrentURL(): URL {
  return new URL(window.location.href);
}

/* METHODS */

export function NavigationGetState(instance: INavigation, index: number = 0): INavigationState | null {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];
  const historyIndex: number = privates.historyIndex + index;
  return ((0 <= historyIndex) && (historyIndex < privates.history.length))
    ? privates.history[historyIndex]
    : null;
}

export function NavigationNavigate(url: string | URL, options: INavigationNavigateOptions = {}): Promise<void> {
  return pendingNavigation = pendingNavigation
    .then(() => {

      if (url instanceof URL) {
        url = url.href;
      } else if (typeof url !== 'string') {
        throw new TypeError(`Expected URL or string as url`);
      }

      const data = {
        id: uuid()
      };

      if (options.replaceState) {
        window.history.replaceState(data, '', url);
      } else {
        window.history.pushState(data, '', url);
      }
    });
}

/**
 * Does a navigation 'back'. Returns a Promise resolved when the navigation is finished
 * INFO: back and forward are in reality async, see comment inside
 */
export function NavigationBack(): Promise<void> {
  /**
   * INFO
   *  nav.go('hello1');
   *  nav.go('hello2');
   *  nav.back();
   *  nav.go('hello3');
   *  // the url will be 'hello1' because back is in reality executed after 'hello3'
   */
  return pendingNavigation = pendingNavigation
    .then(() => {
      return new Promise<void>((resolve: any) => {
        NavigationHistoryUntilPopState(resolve);
        window.history.back();
      });
    });
}

export function NavigationCanBack(instance: INavigation): boolean {
  return ((instance as INavigationInternal)[NAVIGATION_PRIVATE].historyIndex > 0);
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

export function NavigationCanForward(instance: INavigation): boolean {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];
  return ((privates.historyIndex + 1) < privates.history.length);
}

export function NavigationPush(url: string | URL): Promise<void> {
  return NavigationNavigate(url, { replaceState: false });
}

export function NavigationReplace(url: string | URL): Promise<void> {
  return NavigationNavigate(url, { replaceState: true });
}

export function NavigationRefresh(): Promise<void> {
  return NavigationNavigate(window.location.href, { replaceState: true });
}

export function NavigationResetHistory(instance: INavigation): void {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];
  privates.history = [];
  privates.historyIndex = -1;
}

export function NavigationDebug(instance: INavigation): string {
  const privates: INavigationPrivate = (instance as INavigationInternal)[NAVIGATION_PRIVATE];
  return privates.history.map((url, index) => ('-' + ((index === privates.historyIndex) ? '> ' : '  ') + url.toString())).join('\n');
}


/** CLASS **/

export class Navigation extends NotificationsObservable<INavigationKeyValueMap> implements INavigation {

  static create(options?: INavigationOptions): INavigation {
    return new Navigation(options);
  }

  protected constructor(options?: INavigationOptions) {
    let context: INotificationsObservableContext<INavigationKeyValueMap>;
    super((_context: INotificationsObservableContext<INavigationKeyValueMap>) => {
      context = _context;
    });
    // @ts-ignore
    ConstructNavigation(this, context, options);
  }

  get history(): IReadonlyList<INavigationState> {
    return NavigationGetHistory(this);
  }

  get historyIndex(): number {
    return NavigationGetHistoryIndex(this);
  }

  get currentURL(): URL {
    return NavigationGetCurrentURL();
  }


  getState(index?: number): INavigationState | null {
    return NavigationGetState(this, index);
  }

  navigate(url: string | URL, options?: INavigationNavigateOptions): Promise<void> {
    return NavigationNavigate(url, options);
  }

  back(): Promise<void> {
    return NavigationBack();
  }

  canBack(): boolean {
    return NavigationCanBack(this);
  }

  forward(): Promise<void> {
    return NavigationForward();
  }

  canForward(): boolean {
    return NavigationCanForward(this);
  }


  push(url: string | URL): Promise<void> {
    return NavigationPush(url);
  }

  replace(url: string | URL): Promise<void> {
    return NavigationReplace(url);
  }

  refresh(): Promise<void> {
    return NavigationRefresh();
  }


  resetHistory(): void {
    NavigationResetHistory(this);
  }


  addListener<K extends keyof INavigationExtendedKeyValueMap>(name: K, callback: (value: INavigationExtendedKeyValueMap[K]) => void): INotificationsObserver<K, INavigationExtendedKeyValueMap[K]> {
    if (name === 'navigate') {
      return this.pipeThrough(NavigationPipe())
        .addListener('navigate', callback as (value: INavigationState) => void) as any;
    } else {
      return super.addListener<any>(name as any, callback as (value: INavigationState) => void);
    }
  }

  debug(): string {
    return NavigationDebug(this);
  }

}

/** INSTANCE **/

// instance is uniq
export const navigation: INavigation = Navigation.create({ historyLimit: 100 });








