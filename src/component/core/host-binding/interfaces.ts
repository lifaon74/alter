import { IObservable, IObserver, TPromiseOrValue } from '@lifaon/observables/public';
import { ITemplateBuildOptions } from '../../../template/interfaces';


export type THostBindingOnResolveResultValue = any | IObservable<any> | IObserver<any>;
export type THostBindingOnResolveResult = TPromiseOrValue<THostBindingOnResolveResultValue>;
export type THostBindingOnResolve = (node: Element) => THostBindingOnResolveResult;

export interface IHostBindingOptions extends ITemplateBuildOptions {

}

export interface IHostBindingConstructor {
  new(attributeName: string, onResolve: THostBindingOnResolve, options?: IHostBindingOptions): IHostBinding;
}

export interface IHostBinding {
 readonly attributeName: string;

 resolve(node: Element): void;

}

