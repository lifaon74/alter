import { IReadonlyMap } from '@lifaon/observables';

/** TYPES **/

export interface IQueryParamsChange {
  previous: string | null;
  current: string | null;
}

export type TQueryParamChanges<TParams extends string> = IReadonlyMap<TParams, IQueryParamsChange>;
// specifies what action to perform when a new Observer observes this QueryParamsObservable:
export type TEmitOnObserve =
  'always' // emits immediately for this observer a TQueryParamChanges based on the current state of the URL and the observed query param names.
  | 'changes' // emits immediately for this observer a TQueryParamChanges<T> based on the current state of the URL and the observed query param names ONLY if changes occurred since last emit
  | 'none' // (default) emits nothing for this observer, until next change is detected.
  ;

export interface IQueryParamsObservableOptions<TParams extends string> {
  names?: Iterable<TParams>;
  emitOnObserve?: TEmitOnObserve;
}
