import { IHostBinding } from './interfaces';
import { IHostBindingOptionsStrict, THostBindingOnResolve } from './types';
import { TTemplateRawFunction } from '../../template/interfaces';

/** PRIVATES **/

export const HOST_BINDING_PRIVATE = Symbol('host-binding-private');

export interface IHostBindingPrivate<T> {
  attributeName: string;
  onResolve: THostBindingOnResolve<T>;
  options: IHostBindingOptionsStrict;
  templateFunction: TTemplateRawFunction;
  nodeToResolvePromiseWeakMap: WeakMap<HTMLElement, Promise<void>>;
}

export interface IHostBindingPrivatesInternal<T> {
  [HOST_BINDING_PRIVATE]: IHostBindingPrivate<T>;
}

export interface IHostBindingInternal<T> extends IHostBindingPrivatesInternal<T>, IHostBinding<T> {
}
