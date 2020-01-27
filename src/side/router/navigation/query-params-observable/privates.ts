import { IQueryParamsObservable} from './interfaces';
import { INotificationsObserver, IObservableContext, IReadonlyList } from '@lifaon/observables';
import { INavigationState } from '../state/interfaces';
import { TEmitOnObserve, TQueryParamChanges } from './types';

/** PRIVATES **/

export const QUERY_PARAMS_OBSERVABLE_PRIVATE = Symbol('query-params-observable-private');

export interface IQueryParamsObservablePrivate<TParams extends string> {
  context: IObservableContext<TQueryParamChanges<TParams>>;
  names: TParams[] | undefined;
  readonlyNames: IReadonlyList<TParams> | undefined;
  emitOnObserve: TEmitOnObserve;
  timer: any | null;
  url: URL;
  navigationObserver: INotificationsObserver<'navigate', INavigationState>;
  updating: boolean;
}

export interface IQueryParamsObservablePrivatesInternal<TParams extends string> {
  [QUERY_PARAMS_OBSERVABLE_PRIVATE]: IQueryParamsObservablePrivate<TParams>;
}

export interface IQueryParamsObservableInternal<TParams extends string> extends IQueryParamsObservablePrivatesInternal<TParams>, IQueryParamsObservable<TParams> {
}
