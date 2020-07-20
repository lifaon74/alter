import { Expression, IObservableContext, IObserver, Observable } from '@lifaon/observables';
import { TObjectToObjectProperties, TObjectToObjectPropertyObservers } from './types';
import {
  IObjectPropertiesObservable, IObjectPropertiesObservableConstructor, IObjectPropertiesObservablePrivateConstructor
} from './interfaces';
import { IObjectProperty } from '../object-property/interfaces';
import { ObjectProperty } from '../object-property/implementation';
import { IsObjectPropertyObserver, ObjectPropertyObserver } from '../object-property-observer/implementation';
import { IObjectPropertyObserver } from '../object-property-observer/interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { NormalizePropertyKey, TNormalizedPropertyKey } from '../normalize-property-key';
import { GetPropertyDescriptor } from '../../../misc/helpers/object-helpers';
import { PatchArrayProxy } from './functions';
import { IObservablePrivatesInternal } from '@lifaon/observables/types/core/observable/privates';
import { GetObserverPrivates } from '../../../misc/helpers/observables-helpers';


export interface IResolvedProperty<TObject extends object> {
  observers: TObjectToObjectPropertyObservers<TObject>[];
  dynamic: boolean; // true if the value may change at any time (because it's a getter)
  dynamicObserver?: IObserver<any>; // an observer observing a dynamic value
}

const OBJECT_TO_OBJECT_PROPERTIES_OBSERVABLE_MAP = new WeakMap<object, IObjectPropertiesObservable<any>>();

/** PRIVATES **/

export const OBJECT_PROPERTIES_OBSERVABLE_PRIVATE = Symbol('object-properties-observable-private');

export interface IObjectPropertiesObservablePrivate<TObject extends object> {
  context: IObservableContext<TObjectToObjectProperties<TObject>>;
  source: TObject;
  proxy: TObject;
  revokeProxy: () => void;
  propertyObserversMap: Map<TNormalizedPropertyKey, IResolvedProperty<TObject>>; // map from a propertyKey to a list of observers
  othersObservers: IObserver<TObjectToObjectProperties<TObject>>[]; // observers which are not of type IObjectPropertyObserver
}

export interface IObjectPropertiesObservablePrivatesInternal<TObject extends object> extends IObservablePrivatesInternal<TObjectToObjectProperties<TObject>> {
  [OBJECT_PROPERTIES_OBSERVABLE_PRIVATE]: IObjectPropertiesObservablePrivate<TObject>;
}

export interface IObjectPropertiesObservableInternal<TObject extends object> extends IObjectPropertiesObservablePrivatesInternal<TObject>, IObjectPropertiesObservable<TObject> {
}

/** CONSTRUCTOR **/

export function ConstructObjectPropertiesObservable<TObject extends object>(
  instance: IObjectPropertiesObservable<TObject>,
  context: IObservableContext<TObjectToObjectProperties<TObject>>,
  object: TObject,
): void {
  ConstructClassWithPrivateMembers(instance, OBJECT_PROPERTIES_OBSERVABLE_PRIVATE);
  const privates: IObjectPropertiesObservablePrivate<TObject> = (instance as IObjectPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];

  if (!IsObject(object)) {
    throw new TypeError(`Expected object as input`);
  }

  if (OBJECT_TO_OBJECT_PROPERTIES_OBSERVABLE_MAP.has(object)) {
    throw new TypeError(`Object already bound with another ObjectPropertiesObservable`);
  } else {
    OBJECT_TO_OBJECT_PROPERTIES_OBSERVABLE_MAP.set(object, instance);
  }

  privates.context = context;
  privates.source = object;
  privates.propertyObserversMap = new Map<TNormalizedPropertyKey, IResolvedProperty<TObject>>();
  privates.othersObservers = [];

  // info: receiver is the proxy
  const { proxy, revoke } = Proxy.revocable<TObject>(object, {
    get: (target: TObject, propertyKey: PropertyKey, receiver: any): any => {
      return Reflect.get(target, propertyKey, receiver);
    },
    set: (target: TObject, propertyKey: PropertyKey, value: any, receiver: any) => {
      if (Array.isArray(target)) {
        PatchArrayProxy(target, propertyKey, value, receiver);
      }
      const succeed: boolean = Reflect.set(target, propertyKey, value, receiver);
      if (succeed) {
        ObjectPropertiesObservableRefreshProperty<TObject, keyof TObject>(instance, target, propertyKey as keyof TObject);
      }
      return succeed;
    },
    deleteProperty: (target: TObject, propertyKey: PropertyKey): boolean => {
      const succeed: boolean = Reflect.deleteProperty(target, propertyKey);
      if (succeed) {
        ObjectPropertiesObservableRefreshProperty<TObject, keyof TObject>(instance, target, propertyKey as keyof TObject);
      }
      return succeed;
    },
  });

  privates.proxy = proxy;
  privates.revokeProxy = revoke;

}

/** CONSTRUCTOR FUNCTIONS **/

export function ObjectPropertiesObservableOnObserved<TObject extends object>(
  instance: IObjectPropertiesObservable<TObject>,
  observer: IObserver<TObjectToObjectProperties<TObject>>
): void {
  const privates: IObjectPropertiesObservablePrivate<TObject> = (instance as IObjectPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];

  if (IsObjectPropertyObserver<keyof TObject, TObject[keyof TObject]>(observer)) {
    const key: TNormalizedPropertyKey = NormalizePropertyKey<keyof TObject>(observer.key);
    let resolvedProperty: IResolvedProperty<TObject>;
    if (privates.propertyObserversMap.has(key)) {
      resolvedProperty = privates.propertyObserversMap.get(key) as IResolvedProperty<TObject>;
    } else {
      const descriptor: TypedPropertyDescriptor<any> | undefined = GetPropertyDescriptor<any>(privates.source, key);

      resolvedProperty = {
        observers: [],
        dynamic: ((descriptor !== void 0) && ((typeof descriptor.get === 'function') || (descriptor.hasOwnProperty('value') && !descriptor.configurable && !descriptor.enumerable))),
        // INFO: the array's length descriptor is pretty strange: it's a value descriptor which changes without a 'set' on the array's 'length' property.
        // it is roughly detected by checking it is a value non configurable descriptor
      };

      privates.propertyObserversMap.set(key, resolvedProperty);

      if (resolvedProperty.dynamic) { // may only be read through Expression
        resolvedProperty.dynamicObserver = new Expression<any>(() => privates.proxy[key])
          .pipeTo((value: any) => {
            ObjectPropertiesObservableDispatch<TObject, keyof TObject>(instance, key as keyof TObject, value);
          }).activate();
      } else {
        observer.callback.call(observer, privates.proxy[key]);
      }
    }
    resolvedProperty.observers.push(observer);
  } else {
    privates.othersObservers.push(observer);
  }
}


export function ObjectPropertiesObservableOnUnobserved<TObject extends object>(
  instance: IObjectPropertiesObservable<TObject>,
  observer: IObserver<TObjectToObjectProperties<TObject>>
): void {
  const privates: IObjectPropertiesObservablePrivate<TObject> = (instance as IObjectPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];

  if (IsObjectPropertyObserver<keyof TObject, TObject[keyof TObject]>(observer)) {
    const key: TNormalizedPropertyKey = NormalizePropertyKey<keyof TObject>(observer.key);
    const resolvedProperty: IResolvedProperty<TObject> = privates.propertyObserversMap.get(key) as IResolvedProperty<TObject>;
    resolvedProperty.observers.splice(resolvedProperty.observers.indexOf(observer), 1);
    if (resolvedProperty.dynamic && (resolvedProperty.observers.length === 0)) {
      (resolvedProperty.dynamicObserver as IObserver<any>).deactivate();
    }
  } else {
    privates.othersObservers.splice(
      privates.othersObservers.indexOf(observer),
      1
    );
  }
}

/** FUNCTIONS **/

export function ObjectPropertiesObservableRefreshProperty<TObject extends object, TKey extends keyof TObject>(
  instance: IObjectPropertiesObservable<TObject>,
  target: TObject,
  propertyKey: TKey,
): void {
  ObjectPropertiesObservableDispatch<TObject, TKey>(instance, propertyKey, target[propertyKey]);
}

export function ObjectPropertiesObservableDispatch<TObject extends object, TKey extends keyof TObject>(
  instance: IObjectPropertiesObservable<TObject>,
  key: TKey,
  value: TObject[TKey],
  objectProperty?: IObjectProperty<TKey, TObject[TKey]>
) {
  const normalizedKey: TNormalizedPropertyKey = NormalizePropertyKey<TKey>(key);
  const privates: IObjectPropertiesObservablePrivate<TObject> = (instance as IObjectPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];

  if (privates.propertyObserversMap.has(normalizedKey)) {
    const observers: TObjectToObjectPropertyObservers<TObject>[] = (privates.propertyObserversMap.get(normalizedKey) as IResolvedProperty<TObject>).observers.slice(0);
    for (let i = 0, l = observers.length; i < l; i++) {
      observers[i].callback(value);
    }
  }

  const length: number = privates.othersObservers.length;
  if (length > 0) {
    if (objectProperty === void 0) {
      objectProperty = new ObjectProperty<TKey, TObject[TKey]>(key, value);
    }
    for (let i = 0; i < length; i++) {
      GetObserverPrivates(privates.othersObservers[i]).onEmit(objectProperty, instance as any); // instance as unknown as IObservable<IObjectProperty<TKey, TObject[TKey]>>;
    }
  }
}

/** METHODS **/

/* GETTERS/SETTERS */

export function ObjectPropertiesObservableGetProxy<TObject extends object>(instance: IObjectPropertiesObservable<TObject>,): TObject {
  return (instance as IObjectPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE].proxy;
}

/* METHODS */

export function ObjectPropertiesObservableObserveProperty<TObject extends object, TKey extends keyof TObject>(
  instance: IObjectPropertiesObservable<TObject>,
  key: TKey,
  callback: (value: TObject[TKey]) => void
): IObjectPropertyObserver<TKey, TObject[TKey]> {
  return new ObjectPropertyObserver<TKey, TObject[TKey]>(key, callback).observe(instance);
}

/* STATIC */


export function ObjectPropertiesObservableStaticOf<TObject extends object>(
  constructor: IObjectPropertiesObservableConstructor,
  object: TObject
): IObjectPropertiesObservable<TObject> {
  return OBJECT_TO_OBJECT_PROPERTIES_OBSERVABLE_MAP.has(object)
    ? OBJECT_TO_OBJECT_PROPERTIES_OBSERVABLE_MAP.get(object) as IObjectPropertiesObservable<TObject>
    : new (constructor as IObjectPropertiesObservablePrivateConstructor)<TObject>(object);

}

/** CLASS **/

export class ObjectPropertiesObservable<TObject extends object> extends Observable<TObjectToObjectProperties<TObject>> implements IObjectPropertiesObservable<TObject> {

  static of<TObject extends object>(object: TObject): IObjectPropertiesObservable<TObject> {
    return ObjectPropertiesObservableStaticOf<TObject>(this, object);
  }

  protected constructor(object: TObject) {
    let context: IObservableContext<TObjectToObjectProperties<TObject>>;

    super((_context: IObservableContext<TObjectToObjectProperties<TObject>>) => {
      context = _context;
      return {
        onObserved: (observer: IObserver<TObjectToObjectProperties<TObject>>): void => {
          ObjectPropertiesObservableOnObserved<TObject>(this, observer);
        },
        onUnobserved: (observer: IObserver<TObjectToObjectProperties<TObject>>): void => {
          ObjectPropertiesObservableOnUnobserved<TObject>(this, observer);
        }
      };
    });

    // @ts-ignore
    ConstructObjectPropertiesObservable<TObject>(this, context, object);
  }

  get proxy(): TObject {
    return ObjectPropertiesObservableGetProxy<TObject>(this);
  }

  observeProperty<TKey extends keyof TObject>(key: TKey, callback: (value: TObject[TKey]) => void): IObjectPropertyObserver<TKey, TObject[TKey]> {
    return ObjectPropertiesObservableObserveProperty<TObject, TKey>(this, key, callback);
  }
}


/*-----------------------*/

/**
 * WIP building ObjectObservable
 * TODO: add the distinct value code
 * TODO: prepare and think for full object path
 */

export async function debugObjectPropertiesObservable() {
  const array = [0, 1, 2];

  const observable = ObjectPropertiesObservable.of(array);

  observable.observeProperty(0, (value: number) => {
    console.log('0 changed =>', value);
  }).activate();

  observable.observeProperty(3, (value: number) => {
    console.log('3 changed =>', value);
  }).activate();

  observable.observeProperty('length', (value: number) => {
    console.log('length changed =>', value);
  }).activate();

  // observable.proxy[0] = 5;
  // observable.proxy[0] = 6;
  observable.proxy[6] = 6;

}
