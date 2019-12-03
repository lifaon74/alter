import { IHostBinding } from './interfaces';
import { IHostBindingOptions, THostBindingOnResolve, THostBindingOnResolveResultValue } from './types';
import { HOST_BINDING_PRIVATE, IHostBindingInternal, IHostBindingPrivate } from './privates';
import { ConstructHostBinding } from './constructor';


/** METHODS **/

export function HostBindingResolve<T>(instance: IHostBinding<T>, node: Element): Promise<void> {
  const privates: IHostBindingPrivate<T> = (instance as IHostBindingInternal<T>)[HOST_BINDING_PRIVATE];
  if (!privates.nodeToResolvePromiseWeakMap.has(node)) {
    privates.nodeToResolvePromiseWeakMap.set(node,
      privates.templateFunction((name: string) => { // require function
        if (privates.options.dataSourceName.has(name)) {
          return new Promise<any>((resolve: any) => {
            resolve(privates.onResolve(node));
          }).then((value: THostBindingOnResolveResultValue<T>) => {
            return {
              value: value, // INFO: we expect data.value
            };
          });
        } else if (name === 'node') {
          return Promise.resolve(node);
        } else {
          return privates.options.require(name);
        }
      }).then(() => void 0)
    );
  }

  return privates.nodeToResolvePromiseWeakMap.get(node) as Promise<void>;
}

/** CLASS **/

export class HostBinding<T> implements IHostBinding<T> {
  constructor(attributeName: string, onResolve: THostBindingOnResolve<T>, options?: IHostBindingOptions) {
    ConstructHostBinding(this, attributeName, onResolve, options);
  }

  get attributeName(): string {
    return ((this as unknown) as IHostBindingInternal<T>)[HOST_BINDING_PRIVATE].attributeName;
  }

  resolve(node: Element): Promise<void> {
    return HostBindingResolve(this, node);
  }
}













