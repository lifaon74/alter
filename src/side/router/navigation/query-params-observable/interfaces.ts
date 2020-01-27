import { IObservable, IObservableConstructor, IReadonlyList } from '@lifaon/observables';
import { IQueryParamsObservableOptions, TEmitOnObserve, TQueryParamChanges } from './types';


/** INTERFACES **/

export interface IQueryParamsObservableConstructor extends IObservableConstructor {
  new<TParams extends string>(options: IQueryParamsObservableOptions<TParams>): IQueryParamsObservable<TParams>;
}

export interface IQueryParamsObservable<TParams extends string> extends IObservable<TQueryParamChanges<TParams>>, IQueryParamsObservableOptions<TParams> {
  readonly names: IReadonlyList<TParams> | undefined;
  readonly emitOnObserve: TEmitOnObserve;
}
