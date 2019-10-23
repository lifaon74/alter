import { IObservable, IObservableConstructor } from '@lifaon/observables';

export interface IQueryParamsChange {
  previous: string | null;
  current: string | null;
}

// export type TQueryParams<T extends string[]> = {
//   [P in keyof T] : IQueryParamsChange;
// }

export type TQueryParamChanges<T extends string[]> = {
  [P in T[number]]: IQueryParamsChange;
}


export interface IQueryParamsObservableConstructor extends IObservableConstructor {
  new<T extends string[]>(names: T, options?: IQueryParamsObservableOptions): IQueryParamsObservable<T>;
}

export type TEmitOnObserve = 'always' | 'changes' | 'none';

export interface IQueryParamsObservableOptions {
  /**
   * Specify what action to perform when a new Observer observes this QueryParamsObservable:
   *  - always: emits immediately for this observer a TQueryParamChanges<T> based on the current state of the URL and the observed query param names.
   *  - changes: emits immediately for this observer a TQueryParamChanges<T> based on the current state of the URL and the observed query param names ONLY if changes occurred since last emit
   *  - none (default): emits nothing for this observer, until next change is detected.
   */
  emitOnObserve?: TEmitOnObserve;
}

export interface IQueryParamsObservable<T extends string[]> extends IObservable<TQueryParamChanges<T>> {
  readonly names: Readonly<T>;
}
