import { IObservable, IObservableConstructor } from '@lifaon/observables/public';

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
  emitOnObserve?: TEmitOnObserve;
}

export interface IQueryParamsObservable<T extends string[]> extends IObservable<TQueryParamChanges<T>> {
  readonly names: Readonly<T>;
}
