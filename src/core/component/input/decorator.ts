import { IObserver, IsObservable } from '@lifaon/observables';
import { MustExtendHTMLElement } from '../helpers/MustExtendHTMLElement';

export interface IInputDecorationOption {

}

/**
 * Input()
 * set => if value is an Observable, starts observing it and getter will return last emitted value
 *  - setter will be called when Observable emits a value
 * get => if getter is defined, calls the getter, else returns last emitted value
 */
export function Input<T>(options?: IInputDecorationOption): PropertyDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T> | undefined = Object.getOwnPropertyDescriptor(target, propertyKey)
  ): void | TypedPropertyDescriptor<T> => {

    MustExtendHTMLElement(target);

    if (
      (descriptor === void 0)
      || (typeof descriptor.set !== 'function')
    ) {
      throw new TypeError(`@Input: the property '${ String(propertyKey) }' should be at least a setter.`);
    }


    const valueObservers = new WeakMap<any, IObserver<T>>();
    const values = new WeakMap<any, T>();

    return {
      configurable: false,
      enumerable: descriptor.enumerable,
      get: (typeof descriptor.get === 'function')
        ? descriptor.get
        : function get(this: any): T {
          return values.get(this) as T;
        },
      set: function (value: T) {
        if (valueObservers.has(this)) {
          (valueObservers.get(this) as IObserver<T>).deactivate();
          valueObservers.delete(this);
        }

        // const set: (v: any) => void = descriptor.set as (v: any) => void;
        const set = (value: T) => {
          values.set(this, value);
          (descriptor.set as (v: T) => void).call(this, value);
        };

        if (IsObservable(value)) {
          const observer = value.pipeTo(set);
          valueObservers.set(this, observer);
          observer.activate();
        } else {
          set(value);
        }
      }
    };
  };
}

// INFO: think about some enhancement able to link directly an input with a data's property
