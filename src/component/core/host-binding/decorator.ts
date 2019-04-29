import { IHostBinding, IHostBindingOptions } from './interfaces';
import { Constructor } from '../../../classes/factory';
import { GetCustomElementHTMLElementConstructor } from '../custom-element/implementation';
import { AccessComponentConstructorPrivates, IComponentConstructorPrivate } from '../component/decorator';
import {
  DeferredPromise, Expression, IDeferredPromise, IsObservable, IsObserver, ISource, Observer, Source
} from '@lifaon/observables/public';
import { HostBinding } from './implementation';

export function HostBind(attributeName: string, options?: IHostBindingOptions): PropertyDecorator {
  return (target: HTMLElement, propertyKey: string | symbol, descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey)): void | PropertyDescriptor => {

    const elementConstructor: Constructor<HTMLElement> | null = GetCustomElementHTMLElementConstructor<Constructor<HTMLElement>>(target.constructor as Constructor<HTMLElement>);
    if (elementConstructor === null) {
      throw new TypeError(`The class '${ target.constructor.name }' must extend an HTMLElement.`);
    }

    const privates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(target.constructor as Constructor<HTMLElement>);
    const dataMap: WeakMap<Element, IDeferredPromise<any>> = new WeakMap<Element, IDeferredPromise<any>>();
    let resolveTarget: (node: Element) => void;

    const hostBinding: IHostBinding = new HostBinding(attributeName, (node: Element) => {
      resolveTarget(node);
      return dataMap.get(node).promise;
    }, options);

    privates.hostBindings.push(hostBinding);

    const newDescriptor: PropertyDescriptor = {
      configurable: false,
      enumerable: (descriptor === void 0) ? true : descriptor.enumerable,
      get() {
        throw new TypeError(`Cannot get the property '${ String(propertyKey) }'.`);
      },
      set() {
        throw new TypeError(`Cannot set the property '${ String(propertyKey) }'.`);
      }
    };

    function resolveObservableMode(node: Element, valuesMap: WeakMap<Element, any>): void {
      dataMap.set(node, DeferredPromise.resolve<any>(valuesMap.get(node)));
      Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
        set() {
          throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Observable, thus, its setter can't be updated`);
        }
      }));
    }

    function resolveObserverMode(node: Element, valuesMap: WeakMap<Element, any>): void {
      const observer: any = valuesMap.get(node);
      dataMap.set(node, DeferredPromise.resolve<any>(
        IsObserver(observer)
          ? observer
          : new Observer((value: any) => {
            observer.call(node, value);
          }).activate()
      ));
      Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
        set() {
          throw new TypeError(`The property '${ String(propertyKey) }' has been detected as an Observer, thus, its setter can't be updated`);
        }
      }));
    }

    function resolveSourceMode(node: Element, valuesMap: WeakMap<Element, any>): void {
      const source: ISource<any> = new Source<any>().emit(valuesMap.get(node));
      dataMap.set(node, DeferredPromise.resolve<any>(source));
      Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
        set(value: any) {
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
      const valuesMap: WeakMap<Element, any> = new WeakMap<Element, any>();
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

      newDescriptor.get = function () {
        return valuesMap.get(this);
      };

      newDescriptor.set = function (value: any) {
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
      const valuesMap: WeakMap<Element, any> = new WeakMap<Element, any>();

      newDescriptor.get = function () {
        return descriptor.value;
      };

      newDescriptor.set = function (value) {
        descriptor.value = value;
      };

      if (IsObservable(descriptor.value)) {
        resolveTarget = (node: Element) => {
          if (!dataMap.has(node)) {
            valuesMap.set(node, descriptor.value);
            resolveObservableMode(node, valuesMap);
          }
        };
      } else if (IsObserver(descriptor.value) || (typeof descriptor.value === 'function')) {
        resolveTarget = (node: Element) => {
          if (!dataMap.has(node)) {
            valuesMap.set(node, descriptor.value);
            resolveObserverMode(node, valuesMap);
          }
        };
      } else {
        resolveTarget = (node: Element) => {
          if (!dataMap.has(node)) {
            valuesMap.set(node, descriptor.value);
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
            dataMap.set(node, DeferredPromise.resolve<any>(new Expression<any>(() => descriptor.get.call(node))));

            Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
              get: descriptor.get
            }));
          }
        };
        newDescriptor.get = function () {
          resolveTarget(this);
          descriptor.get.call(this);
        };
      }
    } else if (typeof descriptor.set === 'function') {  // setter only => observer
      resolveTarget = (node: Element) => {
        if (!dataMap.has(node)) {
          dataMap.set(node, DeferredPromise.resolve<any>(new Observer<any>((value: any) => descriptor.set.call(node, value)).activate()));

          Object.defineProperty(node, propertyKey, Object.assign(newDescriptor, {
            set: descriptor.set
          }));
        }
      };
      newDescriptor.set = function (value: any) {
        resolveTarget(this);
        descriptor.set.call(this, value);
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

