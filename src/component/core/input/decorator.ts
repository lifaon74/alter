import { IsObservable } from '@lifaon/observables';

export function Input(): PropertyDecorator {
  return (target: HTMLElement, propertyKey: string | symbol, descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey)): void | PropertyDescriptor => {

    if (
      (descriptor === void 0)
      || (typeof descriptor.set !== 'function')
    ) {
      throw new TypeError(`@Input: the property '${ String(propertyKey) }' should be at least a setter.`);
    }


    const valueObservers = new WeakMap<any, any>();
    const values = new WeakMap<any, any>();

    return {
      configurable: false,
      enumerable: descriptor.enumerable,
      get: (typeof descriptor.get === 'function')
        ? descriptor.get
        : function get(): any {
          values.get(this);
        },
      set(value: any) {
        if (valueObservers.has(this)) {
          valueObservers.get(this).deactivate();
          valueObservers.delete(this);
        }

        if (IsObservable(value)) {
          const observer = value.pipeTo((value: any) => {
            values.set(this, value);
            descriptor.set.call(this, value);
          });
          valueObservers.set(this, observer);
          observer.activate();
        } else {
          values.set(this, value);
          descriptor.set.call(this, value);
        }
      }
    };
  };
}

