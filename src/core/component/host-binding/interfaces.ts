import { IObservable, IObserver, TPromiseOrValue } from '@lifaon/observables';
import { ITemplateBuildOptions, ITemplateBuildOptionsStrict } from '../../template/interfaces';

/** TYPES **/

export type THostBindingOnResolveResultValue = any | IObservable<any> | IObserver<any>;
export type THostBindingOnResolveResult = TPromiseOrValue<THostBindingOnResolveResultValue>;
export type THostBindingOnResolve = (node: Element) => THostBindingOnResolveResult;

// export type THostBindOptionsMode = 'source' | 'destination' | 'expression' | 'observable' | 'observer' | 'auto';

export interface IHostBindingOptions extends ITemplateBuildOptions {
}

export interface IHostBindingOptionsStrict extends ITemplateBuildOptionsStrict {
}


/** INTERFACES **/

export interface IHostBindingConstructor {
  new(attributeName: string, onResolve: THostBindingOnResolve, options?: IHostBindingOptions): IHostBinding;
}

export interface IHostBinding {
  readonly attributeName: string;

  resolve(node: Element): Promise<void>;

}

