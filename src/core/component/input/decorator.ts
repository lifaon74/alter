import { IObservable, IObserver, IsObservable } from '@lifaon/observables';
import { MustExtendHTMLElement } from '../helpers/MustExtendHTMLElement';

export type TInput<T> = T;
export type TInputSet<T> = T | IObservable<T>;

export interface IInputDecorationOption {

}

export type TInputCallback<T> = (value: T, instance: any) => void

/**
 * 'set' =>
 *  - if value is an Observable, subscribes to it and emits the values into 'onEmit',
 *  - else (value not an Observable), calls 'onEmit' with the value.
 * 'get' => returns the last emitted value
 */
export function Input<T>(onEmit: TInputCallback<T>, options?: IInputDecorationOption): PropertyDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<TInput<T>> | undefined = Object.getOwnPropertyDescriptor(target, propertyKey)
  ): void | TypedPropertyDescriptor<TInput<T>> => {

    MustExtendHTMLElement(target);

    if (descriptor === void 0) {
      const valueObservers = new WeakMap<any, IObserver<T>>(); // [instance, observer]
      const values = new WeakMap<any, T>(); // [instance, value]

      return {
        configurable: false,
        enumerable: true,
        get: function get(this: any): TInput<T> {
          return values.get(this) as T;
        },
        set: function (value: TInputSet<T>) {
          if (valueObservers.has(this)) {
            (valueObservers.get(this) as IObserver<T>).deactivate();
            valueObservers.delete(this);
          }

          const set = (value: T) => {
            values.set(this, value);
            onEmit.call(this, value, this);
          };

          if (IsObservable<T>(value)) {
            const observer = value.pipeTo(set);
            valueObservers.set(this, observer);
            observer.activate();
          } else {
            set(value as T);
          }
        }
      };
    } else {
      throw new TypeError(`@Input: the property '${ String(propertyKey) }' should not be a getter, nor setter.`);
    }
  };
}

// INFO: think about some enhancement able to link directly an input with a data's property
