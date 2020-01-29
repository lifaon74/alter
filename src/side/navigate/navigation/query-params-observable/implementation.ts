import { IQueryParamsObservable } from './interfaces';
import { IObservableContext, IObserver, IReadonlyList, Observable } from '@lifaon/observables';
import { GetQueryParamChanges, QueryParamChanged } from './functions';
import {
  IQueryParamsObservableInternal, IQueryParamsObservablePrivate, QUERY_PARAMS_OBSERVABLE_PRIVATE
} from './privates';
import { IQueryParamsObservableOptions, TEmitOnObserve, TQueryParamChanges } from './types';
import { ConstructQueryParamsObservable, QueryParamsObservableUpdate } from './constructor';


/** CONSTRUCTOR FUNCTIONS **/

export function QueryParamsObservableOnObserved<TParams extends string>(instance: IQueryParamsObservable<TParams>, observer: IObserver<TQueryParamChanges<TParams>>): void {
  const privates: IQueryParamsObservablePrivate<TParams> = (instance as IQueryParamsObservableInternal<TParams>)[QUERY_PARAMS_OBSERVABLE_PRIVATE];

  const url: URL = new URL(window.location.href);
  if (
    (privates.emitOnObserve === 'always')
    || (
      (privates.emitOnObserve === 'changes')
      && QueryParamChanged(url, void 0, privates.names)
    )
  ) {
    observer.emit(GetQueryParamChanges(url, void 0, privates.names));
  }

  if (privates.timer === null) {
    privates.navigationObserver.activate();
    privates.timer = setInterval(() => {
      QueryParamsObservableUpdate(instance);
    }, 50);
  }
}

export function QueryParamsObservableOnUnobserved<TParams extends string>(instance: IQueryParamsObservable<TParams>): void {
  if (!instance.observed) {
    const privates: IQueryParamsObservablePrivate<TParams> = (instance as IQueryParamsObservableInternal<TParams>)[QUERY_PARAMS_OBSERVABLE_PRIVATE];
    privates.navigationObserver.deactivate();
    clearInterval(privates.timer);
    privates.timer = null;
  }
}

/** METHODS **/

/* GETTERS/SETTERS */

export function QueryParamsObservableGetName<TParams extends string>(instance: IQueryParamsObservable<TParams>): IReadonlyList<TParams> | undefined{
  return (instance as IQueryParamsObservableInternal<TParams>)[QUERY_PARAMS_OBSERVABLE_PRIVATE].readonlyNames;
}

export function QueryParamsObservableGetEmitOnObserve<TParams extends string>(instance: IQueryParamsObservable<TParams>): TEmitOnObserve {
  return (instance as IQueryParamsObservableInternal<TParams>)[QUERY_PARAMS_OBSERVABLE_PRIVATE].emitOnObserve;
}

/** CLASS **/

export class QueryParamsObservable<TParams extends string> extends Observable<TQueryParamChanges<TParams>> implements IQueryParamsObservable<TParams> {
  constructor(options?: IQueryParamsObservableOptions<TParams>) {
    let context: IObservableContext<TQueryParamChanges<TParams>>;
    super((_context: IObservableContext<TQueryParamChanges<TParams>>) => {
      context = _context;
      return {
        onObserved: (observer: IObserver<TQueryParamChanges<TParams>>): void => {
          return QueryParamsObservableOnObserved<TParams>(this, observer);
        },
        onUnobserved: (): void => {
          return QueryParamsObservableOnUnobserved<TParams>(this);
        }
      };
    });
    // @ts-ignore
    ConstructQueryParamsObservable(this, context, options);
  }

  get names(): IReadonlyList<TParams> | undefined {
    return QueryParamsObservableGetName<TParams>(this);
  }

  get emitOnObserve(): TEmitOnObserve {
    return QueryParamsObservableGetEmitOnObserve<TParams>(this);
  }
}






