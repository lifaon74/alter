import { IQueryParamsObservable, IQueryParamsObservableOptions, TEmitOnObserve, TQueryParamChanges } from './interfaces';
import { navigation } from '../implementation';
import { INavigationState } from '../state/interfaces';
import { INotificationsObserver, IObservableContext, IObserver, Observable } from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

export const QUERY_PARAMS_OBSERVABLE_PRIVATE = Symbol('query-params-observable-private');

export interface IQueryParamsObservablePrivate<T extends string[]> {
  context: IObservableContext<TQueryParamChanges<T>>;
  names: T;
  emitOnObserve: TEmitOnObserve;
  timer: any | null;
  url: URL | null;
  navigationObserver: INotificationsObserver<'navigate', INavigationState>;
  updating: boolean;
}

export interface IQueryParamsObservableInternal<T extends string[]> extends IQueryParamsObservable<T> {
  [QUERY_PARAMS_OBSERVABLE_PRIVATE]: IQueryParamsObservablePrivate<T>;
}


export function ConstructQueryParamsObservable<T extends string[]>(
  observable: IQueryParamsObservable<T>,
  context: IObservableContext<TQueryParamChanges<T>>,
  names: T,
  options: IQueryParamsObservableOptions = {}
): void {
  ConstructClassWithPrivateMembers(observable, QUERY_PARAMS_OBSERVABLE_PRIVATE);

  const privates: IQueryParamsObservablePrivate<T> = (observable as IQueryParamsObservableInternal<T>)[QUERY_PARAMS_OBSERVABLE_PRIVATE];

  privates.context = context;
  privates.names = names.slice() as T;

  if (options.emitOnObserve === void 0) {
    privates.emitOnObserve = 'none';
  } else if (['always', 'changes', 'none'].includes(options.emitOnObserve)) {
    privates.emitOnObserve = options.emitOnObserve;
  } else {
    throw new TypeError(`Expected 'always', 'changes' or 'none' as options.emitOnObserve`);
  }

  privates.timer = null;
  privates.url = new URL(window.location.href);
  privates.navigationObserver = navigation.addListener('navigate', () => {
    QueryParamsObservableUpdate<T>(observable);
  });
  privates.updating = false;
}


export function QueryParamChanged<T extends string[]>(names: T, currentURL: URL, previousURL: URL = new URL(window.location.origin)): boolean {
  for (let i = 0, l = names.length; i < l; i++) {
    if ((previousURL.searchParams.get(names[i]) !== currentURL.searchParams.get(names[i]))) {
      return true;
    }
  }
  return false;
}

export function GetQueryParamChanges<T extends string[]>(names: T, currentURL: URL, previousURL: URL = new URL(window.location.origin)): TQueryParamChanges<T> {
  const newState: TQueryParamChanges<T> = {} as any;
  for (let i = 0, l = names.length; i < l; i++) {
    (newState as any)[names[i]] = {
      previous: previousURL.searchParams.get(names[i]),
      current: currentURL.searchParams.get(names[i]),
    };
  }
  return newState;
}

export function QueryParamsObservableUpdate<T extends string[]>(observable: IQueryParamsObservable<T>): void {
  const privates: IQueryParamsObservablePrivate<T> = (observable as IQueryParamsObservableInternal<T>)[QUERY_PARAMS_OBSERVABLE_PRIVATE];
  if (!privates.updating) {
    privates.updating = true;
    const url: URL = new URL(window.location.href);
    if (QueryParamChanged(privates.names, url, privates.url)) {
      privates.context.emit(GetQueryParamChanges(privates.names, url, privates.url));
      privates.url = url;
    }
    privates.updating = false;
  }
}

export function QueryParamsObservableOnObserved<T extends string[]>(observable: IQueryParamsObservable<T>, observer: IObserver<TQueryParamChanges<T>>): void {
  const privates: IQueryParamsObservablePrivate<T> = (observable as IQueryParamsObservableInternal<T>)[QUERY_PARAMS_OBSERVABLE_PRIVATE];

  const url: URL = new URL(window.location.href);
  if (
    (privates.emitOnObserve === 'always')
    || ((privates.emitOnObserve === 'changes') && QueryParamChanged(privates.names, url))
  ) {
    observer.emit(GetQueryParamChanges(privates.names, url));
  }

  if (privates.timer === null) {
    privates.navigationObserver.activate();
    privates.timer = setInterval(() => {
      QueryParamsObservableUpdate(observable);
    }, 50);
  }
}

export function QueryParamsObservableOnUnobserved<T extends string[]>(observable: IQueryParamsObservable<T>): void {
  if (!observable.observed) {
    (observable as IQueryParamsObservableInternal<T>)[QUERY_PARAMS_OBSERVABLE_PRIVATE].navigationObserver.deactivate();
    clearInterval((observable as IQueryParamsObservableInternal<T>)[QUERY_PARAMS_OBSERVABLE_PRIVATE].timer);
    (observable as IQueryParamsObservableInternal<T>)[QUERY_PARAMS_OBSERVABLE_PRIVATE].timer = null;
  }
}


export class QueryParamsObservable<T extends string[]> extends Observable<TQueryParamChanges<T>> implements IQueryParamsObservable<T> {
  constructor(names: T, options?: IQueryParamsObservableOptions) {
    let context: IObservableContext<TQueryParamChanges<T>> = void 0;
    super((_context: IObservableContext<TQueryParamChanges<T>>) => {
      context = _context;
      return {
        onObserved: (observer: IObserver<TQueryParamChanges<T>>): void => {
          return QueryParamsObservableOnObserved<T>(this, observer);
        },
        onUnobserved: (): void => {
          return QueryParamsObservableOnUnobserved<T>(this);
        }
      };
    });
    ConstructQueryParamsObservable(this, context, names, options);
  }

  get names(): Readonly<T> {
    return ((this as unknown) as IQueryParamsObservableInternal<T>)[QUERY_PARAMS_OBSERVABLE_PRIVATE].names;
  }
}





export async function testQueryParamsChange() {
  const observable = new QueryParamsObservable(['id']);
  observable.pipeTo((result: any) => {
    console.log('change', result);
  }).activate();

  const url = new URL(window.location.href);
  url.searchParams.set('id', 'my-id-1');
  await navigation.navigate(url, { replaceState: true });
  url.searchParams.set('id', 'my-id-2');
  await navigation.navigate(url, { replaceState: true });
  url.searchParams.delete('id');
  await navigation.navigate(url, { replaceState: true });
}