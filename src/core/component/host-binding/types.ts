import { ITemplateBuildOptions, INormalizedTemplateBuildOptions } from '../../template/interfaces';
import { IObservable, IObserver, TNativePromiseLikeOrValue } from '@lifaon/observables';

/** TYPES **/

export type THostBindingOnResolveResultValue<T> = T | IObservable<T> | IObserver<T>;
export type THostBindingOnResolveResult<T> = TNativePromiseLikeOrValue<THostBindingOnResolveResultValue<T>>;
export type THostBindingOnResolve<T> = (node: HTMLElement) => THostBindingOnResolveResult<T>;

// export type THostBindOptionsMode = 'source' | 'destination' | 'expression' | 'observable' | 'observer' | 'auto';

export interface IHostBindingOptions extends ITemplateBuildOptions {
}

export interface IHostBindingOptionsStrict extends INormalizedTemplateBuildOptions {
}
