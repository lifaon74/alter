import { ITemplateBuildOptions, ITemplateBuildOptionsStrict } from '../../template/interfaces';
import { IObservable, IObserver, TPromiseOrValue } from '@lifaon/observables';

/** TYPES **/

export type THostBindingOnResolveResultValue<T> = T | IObservable<T> | IObserver<T>;
export type THostBindingOnResolveResult<T> = TPromiseOrValue<THostBindingOnResolveResultValue<T>>;
export type THostBindingOnResolve<T> = (node: HTMLElement) => THostBindingOnResolveResult<T>;

// export type THostBindOptionsMode = 'source' | 'destination' | 'expression' | 'observable' | 'observer' | 'auto';

export interface IHostBindingOptions extends ITemplateBuildOptions {
}

export interface IHostBindingOptionsStrict extends ITemplateBuildOptionsStrict {
}
