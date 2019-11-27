import { IsObservable } from '@lifaon/observables';

/**
 * Input()
 * set => if value is an Observable, starts observing it and getter will return last emitted value
 *  - setter will be called when Observable emits a value
 * get => if getter is defined, calls the getter, else returns last emitted value
 */
export function Input(): PropertyDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target, propertyKey)
  ): void | PropertyDescriptor => {

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
        : function get(this: any): any {
          values.get(this);
        },
      set: function (value: any) {
        if (valueObservers.has(this)) {
          valueObservers.get(this).deactivate();
          valueObservers.delete(this);
        }

        const set: (v: any) => void = descriptor.set as (v: any) => void;

        if (IsObservable(value)) {
          const observer = value.pipeTo((value: any) => {
            values.set(this, value);
            set.call(this, value);
          });
          valueObservers.set(this, observer);
          observer.activate();
        } else {
          values.set(this, value);
          set.call(this, value);
        }
      }
    };
  };
}

