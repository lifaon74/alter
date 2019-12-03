import { IHostBinding } from './interfaces';
import { Constructor } from '../../../classes/factory';
import {
  DeferredPromise, Expression, IDeferredPromise, IObserver, IsObservable, IsObserver, ISource, Observer, Source
} from '@lifaon/observables';
import { HostBinding } from './implementation';
import { AccessComponentConstructorPrivates, IComponentConstructorPrivate } from '../component/class/privates';
import { MustExtendHTMLElement } from '../helpers/MustExtendHTMLElement';
import { IHostBindingOptions, THostBindingOnResolveResultValue } from './types';


export type THostBindValue<T> = THostBindingOnResolveResultValue<T> | ((value: T) => void);


/**
 * DECORATOR (PROPERTY, including setters and getters)
 *
 * Creates a new HostBinding for this specific class.
 *
 *  - the behaviour may vary depending on the descriptor (is it a setter/getter ? does it exists ? etc...):
 *
 *     - if descriptor is undefined (for example on a simple class attribute) => the first value assigned will determine the data source
 *        - if it's an observable => this observable will be used as data source, and setting another value will throw an error
 *        - if it's an observer => this observer will be used as data source, and setting another value will throw an error
 *        - if it's a function => creates a new Observer based on this function and apply the same behaviour seen just above
 *        - else (some value) => creates a new Source which will emit and cache this value, and all future values set
 *
 *     - if descriptor has a 'value' property => follow the same behaviour as above using this value
 *
 *     - if descriptor is a getter (has a 'get' property) => creates a new Expression based on this getter function, and use it as the data source
 *       -> info: no setter is allowed and setting a value will throw an error
 *
 *     - if descriptor is a setter (has a 'set' property) => creates a new Observer based on this setter function, and use it as the data source
 *       -> info: no getter is allowed and getting a value will throw an error
 *       -> getter and setter cannot exists simultaneously for an HostBind !
 */
export function HostBind<T>(attributeName: string, options?: IHostBindingOptions): PropertyDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T> | undefined = Object.getOwnPropertyDescriptor(target, propertyKey)
  ): void | TypedPropertyDescriptor<THostBindValue<T>> => {

    MustExtendHTMLElement(target);

    type TValue = THostBindValue<T>;

    const privates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(target.constructor as Constructor<HTMLElement>);
    const dataMap: WeakMap<Element, IDeferredPromise<THostBindingOnResolveResultValue<T>>> = new WeakMap<Element, IDeferredPromise<THostBindingOnResolveResultValue<T>>>();
    let resolveTarget: (node: Element) => void;

    const hostBinding: IHostBinding<T> = new HostBinding<T>(attributeName, (node: Element) => {
      resolveTarget(node);
      return (dataMap.get(node) as IDeferredPromise<THostBindingOnResolveResultValue<T>>).promise;
    }, options);

    privates.hostBindings.push(hostBinding);

    const newDescriptor: TypedPropertyDescriptor<THostBindValue<T>> = {
      configurable: false,
      enumerable: (descriptor === void 0) ? true : descriptor.enumerable,
      get() {
        throw new TypeError(`Cannot get the property '${ String(propertyKey) }'.`);
      },
      set() {
        throw new TypeError(`Cannot set the property '${ String(propertyKey) }'.`);
      }
    };

    function resolveObservableMode(node: Element, valuesMap: WeakMap<Element, TValue>): void {
      dataMap.set(node, DeferredPromise.resolve<THostBindingOnResolveResultValue<T>>(valuesMap.get(node) as T));
      Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
        set() {
          throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Observable, thus, its setter can't be updated`);
        }
      }));
    }

    function resolveObserverMode(node: Element, valuesMap: WeakMap<Element, TValue>): void {
      const observer: TValue = valuesMap.get(node) as TValue;
      dataMap.set(node, DeferredPromise.resolve<THostBindingOnResolveResultValue<T>>(
        IsObserver(observer)
          ? observer as IObserver<T>
          : new Observer<T>((value: T) => {
            (observer as (value: T) => void).call(node, value);
          }).activate()
      ));
      Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
        set() {
          throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Observer, thus, its setter can't be updated`);
        }
      }));
    }

    function resolveSourceMode(node: Element, valuesMap: WeakMap<Element, TValue>): void {
      const source: ISource<T> = new Source<T>().emit(valuesMap.get(node) as T);
      dataMap.set(node, DeferredPromise.resolve<THostBindingOnResolveResultValue<T>>(source));
      Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
        set(this: Element, value: T) {
          if (this === node) {
            if (IsObservable(value) || IsObserver(value) || (typeof value === 'function')) {
              throw new TypeError(`The property '${ String(propertyKey) }' has been detected as a Source, thus, its setter can't receive data of type Observable, Observer or function`);
            } else {
              valuesMap.set(this, value);
              source.emit(value);
            }
          } else {
            throw new TypeError(`The property '${ String(propertyKey) }' has been detected as a Source, thus, its setter can't be updated with a different this`);
          }
        }
      }));
    }

    if (descriptor === void 0) {
      type TMode = 'observer' | 'observable' | 'source';
      const valuesMap: WeakMap<Element, TValue> = new WeakMap<Element, TValue>();
      const modesMap: WeakMap<Element, TMode> = new WeakMap<Element, TMode>();

      resolveTarget = (node: Element) => {
        if (!dataMap.has(node)) {
          if (modesMap.has(node)) {
            switch (modesMap.get(node)) {
              case 'observable':
                resolveObservableMode(node, valuesMap);
                break;
              case 'observer':
                resolveObserverMode(node, valuesMap);
                break;
              case 'source':
                resolveSourceMode(node, valuesMap);
                break;
              default:
                throw new TypeError(`Unexpected mode ${ modesMap.get(node) }`);
            }
          }
        }
      };

      newDescriptor.get = function (this: Element) {
        return valuesMap.get(this) as TValue;
      };

      newDescriptor.set = function (this: Element, value: TValue) {
        valuesMap.set(this, value);
        if (modesMap.has(this)) { // direct call to the setter, bad behaviour
          // nothing to do
        } else {
          if (IsObservable(value)) {
            modesMap.set(this, 'observable');
          } else if (IsObserver(value) || (typeof value === 'function')) {
            modesMap.set(this, 'observer');
          } else {
            modesMap.set(this, 'source');
          }
          resolveTarget(this);
        }
      };

    } else if ('value' in descriptor) {
      const valuesMap: WeakMap<Element, TValue> = new WeakMap<Element, TValue>();
      let value: TValue = descriptor.value as TValue;

      newDescriptor.get = function () {
        return value;
      };

      newDescriptor.set = function (_value: TValue) {
        value = _value;
      };

      if (IsObservable(value)) {
        resolveTarget = (node: Element) => {
          if (!dataMap.has(node)) {
            valuesMap.set(node, value);
            resolveObservableMode(node, valuesMap);
          }
        };
      } else if (IsObserver(value) || (typeof value === 'function')) {
        resolveTarget = (node: Element) => {
          if (!dataMap.has(node)) {
            valuesMap.set(node, value);
            resolveObserverMode(node, valuesMap);
          }
        };
      } else {
        resolveTarget = (node: Element) => {
          if (!dataMap.has(node)) {
            valuesMap.set(node, value);
            resolveSourceMode(node, valuesMap);
          }
        };
      }
    } else if (typeof descriptor.get === 'function') { // getter => expression
      if (typeof descriptor.set === 'function') {
        throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Expression, thus, no setter is expected.`);
      } else {
        resolveTarget = (node: Element) => {
          if (!dataMap.has(node)) {
            dataMap.set(node, DeferredPromise.resolve<THostBindingOnResolveResultValue<T>>(new Expression<T>(() => (descriptor.get as () => T).call(node))));

            Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
              get: descriptor.get
            }));
          }
        };
        newDescriptor.get = function (this: Element) {
          resolveTarget(this);
          return (descriptor.get as () => T).call(this);
        };
      }
    } else if (typeof descriptor.set === 'function') {  // setter only => observer
      resolveTarget = (node: Element) => {
        if (!dataMap.has(node)) {
          dataMap.set(node, DeferredPromise.resolve<THostBindingOnResolveResultValue<T>>(new Observer<T>((value: T) => (descriptor.set as (value: T) => void).call(node, value)).activate()));

          Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
            set: descriptor.set
          }));
        }
      };
      newDescriptor.set = function (this: Element, value: TValue) {
        resolveTarget(this);
        (descriptor.set as (value: TValue) => void).call(this, value);
      };
    } else {
      throw new Error(`Malformed descriptor`);
    }

    if (descriptor === void 0) {
      Object.defineProperty(target, propertyKey, newDescriptor);
    } else {
      return newDescriptor;
    }
  };
}

