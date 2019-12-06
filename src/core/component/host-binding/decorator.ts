import { IHostBinding } from './interfaces';
import { Constructor } from '../../../classes/factory';
import {
  DeferredPromise, Expression, IDeferredPromise, IExpression, IObserver, IsObservable, IsObserver, ISource, Observer,
  Source
} from '@lifaon/observables';
import { HostBinding } from './implementation';
import { AccessComponentConstructorPrivates, IComponentConstructorPrivate } from '../component/class/privates';
import { MustExtendHTMLElement } from '../helpers/MustExtendHTMLElement';
import {
  IHostBindingOptionsStrict, THostBindingOnResolve, THostBindingOnResolveResult, THostBindingOnResolveResultValue
} from './types';


export type THostBindValue<T> = THostBindingOnResolveResultValue<T> | ((this: HTMLElement, value: T) => void);


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
 *     - if descriptor has a 'value' property
 *        - if it's a function:
 *          - creates a new Observer based on this function
 *          - this observer will be used as data source
 *          - setting another value will throw an error
 *        - if its not a function throw an error
 *
 *     - if descriptor is a getter (has a 'get' property) => creates a new Expression based on this getter function, and use it as the data source
 *       -> info: no setter is allowed and setting a value will throw an error
 *
 *     - if descriptor is a setter (has a 'set' property) => creates a new Observer based on this setter function, and use it as the data source
 *       -> info: no getter is allowed and getting a value will throw an error
 *       -> info: getter and setter cannot exists simultaneously for an HostBind !
 */
export function HostBind<T>(attributeName: string, options: IHostBindingOptionsStrict): PropertyDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T> | undefined = Object.getOwnPropertyDescriptor(target, propertyKey)
  ): void | TypedPropertyDescriptor<THostBindValue<T>> => {
    MustExtendHTMLElement(target);

    type TValue = THostBindValue<T>;

    const privates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(target.constructor as Constructor<HTMLElement>);

    //  map from a node to a promise resolved with a data -> because data may be SET after the template resolution (so the template resolution is paused)
    const deferredDataMap: WeakMap<HTMLElement, IDeferredPromise<THostBindingOnResolveResultValue<T>>> = new WeakMap<HTMLElement, IDeferredPromise<THostBindingOnResolveResultValue<T>>>();

    // gets or creates a DeferredPromise from 'deferredDataMap' for a specific node
    const getDeferredDataMapValue = (node: HTMLElement): IDeferredPromise<THostBindingOnResolveResultValue<T>> => {
      if (!deferredDataMap.has(node)) {
        deferredDataMap.set(node, new DeferredPromise<THostBindingOnResolveResultValue<T>>());
      }
      return (deferredDataMap.get(node) as IDeferredPromise<THostBindingOnResolveResultValue<T>>);
    };

    // gets or creates a DeferredPromise from 'deferredDataMap' for a specific node and resolves it
    const resolveDeferredDataMapValue = (node: HTMLElement, value: THostBindingOnResolveResultValue<T>): void => {
      getDeferredDataMapValue(node).resolve(value);
    };

    const isDeferredDataMapValuePending = (node: HTMLElement): boolean => {
      return (getDeferredDataMapValue(node).status === 'pending');
    };


    // called when the HostBinding is resolved
    let resolveTarget: THostBindingOnResolve<T>;

    // when the HostBinding is resolved, get/create a DeferredPromise used to sent the data to the template => the template execution is paused until resolved, meaning that 'data' may exists later
    const hostBinding: IHostBinding<T> = new HostBinding<T>(attributeName, (node: HTMLElement) => {
      return resolveTarget(node);
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


    if (descriptor === void 0) { // mode will be determined when setting a value
      type TMode = 'observer' | 'observable' | 'source';
      // map from a node to its stored value
      const valuesMap: WeakMap<HTMLElement, TValue> = new WeakMap<HTMLElement, TValue>();
      // map from a node to its detected mode
      const modesMap: WeakMap<HTMLElement, TMode> = new WeakMap<HTMLElement, TMode>();

      // following functions update the 'setter' because it became resolved

      /**
       * Appends when the property is detected as an observable:
       *  - data is resolved with this Observable
       *  - setter is disabled
       */
      const resolveObservableMode = (node: HTMLElement, valuesMap: WeakMap<HTMLElement, TValue>): T => {
        Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
          set() {
            throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Observable, thus, its setter can't be updated`);
          }
        }));
        return valuesMap.get(node) as T;
      };

      /**
       * Appends when the property is detected as an observer (Observer or function):
       *  - data is resolved with this Observer (cast to Observer)
       *  - setter is disabled
       */
      const resolveObserverMode = (node: HTMLElement, valuesMap: WeakMap<HTMLElement, TValue>): IObserver<T> => {
        Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
          set() {
            throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Observer, thus, its setter can't be updated`);
          }
        }));

        const observer: TValue = valuesMap.get(node) as TValue;

        return IsObserver(observer)
          ? observer
          : new Observer<T>((value: T) => {
            (observer as (value: T) => void).call(node, value);
          }).activate();
      };

      /**
       * Appends when the property is detected as a simple value (not an Observer nor Observable):
       *  - data is resolved with a Source built from this value
       *  - setting a value will transfer it to the source
       *  - setter with type different that a simple value is disabled
       */
      const resolveSourceMode = (node: HTMLElement, valuesMap: WeakMap<HTMLElement, TValue>): ISource<T> => {
        const source: ISource<T> = new Source<T>().emit(valuesMap.get(node) as T);

        Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
          set(this: HTMLElement, value: T) {
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

        return source;
      };

      const resolveMode = (node: HTMLElement, mode: TMode) => {
        switch (mode) {
          case 'observable':
            return resolveObservableMode(node, valuesMap);
          case 'observer':
            return resolveObserverMode(node, valuesMap);
          case 'source':
            return resolveSourceMode(node, valuesMap);
          default:
            throw new TypeError(`Unexpected mode ${ mode }`);
        }
      };

      const detectMode = (value: TValue): TMode => {
        if (IsObservable(value)) {
          return 'observable';
        } else if (IsObserver(value) || (typeof value === 'function')) {
          return 'observer';
        } else {
          return 'source';
        }
      };

      // may append before the setter is called
      resolveTarget = (node: HTMLElement): THostBindingOnResolveResult<T> => {
        return getDeferredDataMapValue(node).promise;
      };

      newDescriptor.get = function (this: HTMLElement) {
        return valuesMap.get(this) as TValue;
      };

      newDescriptor.set = function (this: HTMLElement, value: TValue) {
        if (modesMap.has(this)) { // mode already detected
          throw new Error(`Cannot call directly the prototype's setter for this node, because it has already been resolved`);
        } else { // mode not detected yet
          valuesMap.set(this, value);
          const mode: TMode = detectMode(value);
          modesMap.set(this, mode);
          resolveDeferredDataMapValue(this, resolveMode(this, mode));
        }
      };
    } else if ('value' in descriptor) {
      if (typeof descriptor.value === 'function') {
        type TMethod = (this: HTMLElement, value: T) => void;
        const callback: TMethod = descriptor.value as unknown as TMethod;

        const get: () => TMethod = () => {
          return callback;
        };

        resolveTarget = (node: HTMLElement): THostBindingOnResolveResult<T> => {
          if (isDeferredDataMapValuePending(node)) {
            Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
              get: get
            }));
            const observer: IObserver<any> = new Observer<any>((value: T) => {
              callback.call(node, value);
            }).activate();
            resolveDeferredDataMapValue(node, observer);
          }
          return getDeferredDataMapValue(node);
        };

        newDescriptor.get = function (this: HTMLElement) {
          resolveTarget(this);
          return get.call(this);
        };

        newDescriptor.set = function (this: HTMLElement) {
          throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Observer, thus, its setter can't be updated`);
        };
      } else {
        throw new Error(`Value descriptor may only be a method`);
      }
    } else if (typeof descriptor.get === 'function') { // getter => expression
      if (typeof descriptor.set === 'function') {
        throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Expression, thus, no setter is expected.`);
      } else {
        const get: () => T = descriptor.get;

        resolveTarget = (node: HTMLElement): THostBindingOnResolveResult<T> => {
          if (isDeferredDataMapValuePending(node)) {
            Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
              get: get
            }));
            const observable: IExpression<T> = new Expression<T>(() => get.call(node));
            resolveDeferredDataMapValue(node, observable);
          }
          return getDeferredDataMapValue(node);
        };
        newDescriptor.get = function (this: HTMLElement) {
          resolveTarget(this);
          return get.call(this);
        };
      }
    } else if (typeof descriptor.set === 'function') {  // setter only => observer
      const set: (value: T) => void = descriptor.set;

      resolveTarget = (node: HTMLElement): THostBindingOnResolveResult<T> => {
        if (isDeferredDataMapValuePending(node)) {
          Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
            set: set
          }));
          const observer: IObserver<T> = new Observer<T>((value: T) => set.call(node, value)).activate();
          resolveDeferredDataMapValue(node, observer);
        }
        return getDeferredDataMapValue(node);
      };
      newDescriptor.set = function (this: HTMLElement, value: TValue) {
        resolveTarget(this);
        set.call(this, value);
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

