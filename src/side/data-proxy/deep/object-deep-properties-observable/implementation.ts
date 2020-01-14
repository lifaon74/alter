import { IObservableContext, IObserver, Observable } from '@lifaon/observables';
import { IObjectDeepPropertiesObservable } from './interfaces';
import { IObjectDeepProperty } from '../object-deep-property/interfaces';
import { IObjectPropertyObserver } from '../../object-property-observer/interfaces';
import { IObjectDeepPropertyObserver } from '../object-deep-property-observer/interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { PatchArrayProxy } from '../../object-properties-observable/functions';
import { IObservablePrivatesInternal } from '@lifaon/observables/types/core/observable/privates';
import { IsObjectPropertyObserver } from '../../object-property-observer/implementation';
import {
  IsObjectDeepPropertyObserver, ObjectDeepPropertyObserver
} from '../object-deep-property-observer/implementation';
import { NormalizePropertyKey, TNormalizedPropertyKey } from '../../normalize-property-key';


// export interface IResolvedProperty<TObject extends object> {
//   observers: TObjectToObjectPropertyObservers<TObject>[];
//   dynamic: boolean; // true if the value may change at any time (because it's a getter)
//   dynamicObserver?: IObserver<any>; // an observer observing a dynamic value
// }


/** PRIVATES **/

export const OBJECT_PROPERTIES_OBSERVABLE_PRIVATE = Symbol('object-properties-observable-private');

export interface IObjectDeepPropertiesObservablePrivate<TObject extends object> {
  context: IObservableContext<IObjectDeepProperty<any>>;
  source: TObject;
  proxy: TObject;
  revokeProxy: () => void;
  // propertyObserversMap: Map<TNormalizedPropertyKey, IResolvedProperty<TObject>>; // map from a propertyKey to a list of observers
  // othersObservers: IObserver<TObjectToObjectDeepProperties<TObject>>[]; // observers which are not of type IObjectPropertyObserver
}

export interface IObjectDeepPropertiesObservablePrivatesInternal<TObject extends object> extends IObservablePrivatesInternal<IObjectDeepProperty<any>> {
  [OBJECT_PROPERTIES_OBSERVABLE_PRIVATE]: IObjectDeepPropertiesObservablePrivate<TObject>;
}

export interface IObjectDeepPropertiesObservableInternal<TObject extends object> extends IObjectDeepPropertiesObservablePrivatesInternal<TObject>, IObjectDeepPropertiesObservable<TObject> {
}

/** CONSTRUCTOR **/

export function ConstructObjectDeepPropertiesObservable<TObject extends object>(
  instance: IObjectDeepPropertiesObservable<TObject>,
  context: IObservableContext<IObjectDeepProperty<any>>,
  object: TObject,
): void {
  ConstructClassWithPrivateMembers(instance, OBJECT_PROPERTIES_OBSERVABLE_PRIVATE);
  const privates: IObjectDeepPropertiesObservablePrivate<TObject> = (instance as IObjectDeepPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];

  if (!IsObject(object)) {
    throw new TypeError(`Expected object as input`);
  }

  privates.context = context;
  privates.source = object;
  // privates.propertyObserversMap = new Map<TNormalizedPropertyKey, IResolvedProperty<TObject>>();
  // privates.othersObservers = [];

  // info: receiver is the proxy
  const { proxy, revoke } = Proxy.revocable<TObject>(object, {
    get: (target: TObject, propertyKey: PropertyKey, receiver: any): any => {
      return Reflect.get(target, propertyKey, receiver);
    },
    set: (target: TObject, propertyKey: PropertyKey, value: any, receiver: any) => {
      if (Array.isArray(target)) {
        PatchArrayProxy(target, propertyKey, value, receiver);
      }
      throw 'TODO'; // TODO
      // const succeed: boolean = Reflect.set(target, propertyKey, value, receiver);
      // if (succeed) {
      //   ObjectDeepPropertiesObservableRefreshProperty<TObject, keyof TObject>(instance, target, propertyKey as keyof TObject);
      // }
      // return succeed;
    },
    deleteProperty: (target: TObject, propertyKey: PropertyKey): boolean => {
      throw 'TODO'; // TODO
      // const succeed: boolean = Reflect.deleteProperty(target, propertyKey);
      // if (succeed) {
      //   ObjectDeepPropertiesObservableRefreshProperty<TObject, keyof TObject>(instance, target, propertyKey as keyof TObject);
      // }
      // return succeed;
    },
  });

  privates.proxy = proxy;
  privates.revokeProxy = revoke;

}

/** CONSTRUCTOR FUNCTIONS **/

export function ObjectDeepPropertiesObservableOnObserved<TObject extends object>(
  instance: IObjectDeepPropertiesObservable<TObject>,
  observer: IObserver<IObjectDeepProperty<any>>
): void {
  const privates: IObjectDeepPropertiesObservablePrivate<TObject> = (instance as IObjectDeepPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];

  if (IsObjectDeepPropertyObserver<any>(observer)) {
    // const key: TNormalizedPropertyKey = NormalizePropertyKey<keyof TObject>(observer.key);
    throw 'TODO'; // TODO
    // let resolvedProperty: IResolvedProperty<TObject>;
    // if (privates.propertyObserversMap.has(key)) {
    //   resolvedProperty = privates.propertyObserversMap.get(key) as IResolvedProperty<TObject>;
    // } else {
    //   const descriptor: TypedPropertyDescriptor<any> | undefined = GetPropertyDescriptor<any>(privates.source, key);
    //
    //   resolvedProperty = {
    //     observers: [],
    //     dynamic: ((descriptor !== void 0) && ((typeof descriptor.get === 'function') || (descriptor.hasOwnProperty('value') && !descriptor.configurable && !descriptor.enumerable))),
    //     // INFO: the array's length descriptor is pretty strange: it's a value descriptor which changes without a 'set' on the array's 'length' property.
    //     // it is roughly detected by checking it is a value non configurable descriptor
    //   };
    //
    //   privates.propertyObserversMap.set(key, resolvedProperty);
    //
    //   if (resolvedProperty.dynamic) { // may only be read through Expression
    //     resolvedProperty.dynamicObserver = new Expression<any>(() => privates.proxy[key])
    //       .pipeTo((value: any) => {
    //         ObjectDeepPropertiesObservableDispatch<TObject, keyof TObject>(instance, key as keyof TObject, value);
    //       }).activate();
    //   } else {
    //     observer.callback.call(observer, privates.proxy[key]);
    //   }
    // }
    // resolvedProperty.observers.push(observer);
  } else {
    throw new Error(`Only ObjectDeepPropertyObserver may observe an ObjectDeepPropertiesObservable`);
  }
}


export function ObjectDeepPropertiesObservableOnUnobserved<TObject extends object>(
  instance: IObjectDeepPropertiesObservable<TObject>,
  observer: IObserver<IObjectDeepProperty<any>>
): void {
  const privates: IObjectDeepPropertiesObservablePrivate<TObject> = (instance as IObjectDeepPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];

  if (IsObjectDeepPropertyObserver<any>(observer)) {
    throw 'TODO'; // TODO
    // const key: TNormalizedPropertyKey = NormalizePropertyKey<keyof TObject>(observer.key);
    // const resolvedProperty: IResolvedProperty<TObject> = privates.propertyObserversMap.get(key) as IResolvedProperty<TObject>;
    // resolvedProperty.observers.splice(resolvedProperty.observers.indexOf(observer), 1);
    // if (resolvedProperty.dynamic && (resolvedProperty.observers.length === 0)) {
    //   (resolvedProperty.dynamicObserver as IObserver<any>).deactivate();
    // }
  } else {
    throw new Error(`Only ObjectDeepPropertyObserver may unobserve an ObjectDeepPropertiesObservable`);
  }
}

/** FUNCTIONS **/

// export function ObjectDeepPropertiesObservableRefreshProperty<TObject extends object, TKey extends keyof TObject>(
//   instance: IObjectDeepPropertiesObservable<TObject>,
//   target: TObject,
//   propertyKey: TKey,
// ): void {
//   ObjectDeepPropertiesObservableDispatch<TObject, TKey>(instance, propertyKey, target[propertyKey]);
// }

export function ObjectDeepPropertiesObservableDispatch<TObject extends object, TValue>(
  instance: IObjectDeepPropertiesObservable<TObject>,
  path: Iterable<PropertyKey>,
  value: TValue,
  objectProperty?: IObjectDeepProperty<TValue>
) {
  throw 'TODO'; // TODO
  // const normalizedKey: TNormalizedPropertyKey = NormalizePropertyKey<TKey>(key);
  // const privates: IObjectDeepPropertiesObservablePrivate<TObject> = (instance as IObjectDeepPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE];
  //
  // if (privates.propertyObserversMap.has(normalizedKey)) {
  //   const observers: TObjectToObjectPropertyObservers<TObject>[] = (privates.propertyObserversMap.get(normalizedKey) as IResolvedProperty<TObject>).observers.slice(0);
  //   for (let i = 0, l = observers.length; i < l; i++) {
  //     observers[i].callback(value);
  //   }
  // }
  //
  // const length: number = privates.othersObservers.length;
  // if (length > 0) {
  //   if (objectProperty === void 0) {
  //     objectProperty = new ObjectProperty<TKey, TObject[TKey]>(key, value);
  //   }
  //   for (let i = 0; i < length; i++) {
  //     ((privates.othersObservers[i] as unknown) as IObserverInternal<IObjectProperty<TKey, TObject[TKey]>>)[OBSERVER_PRIVATE].onEmit(objectProperty, instance as any); // instance as unknown as IObservable<IObjectProperty<TKey, TObject[TKey]>>
  //   }
  // }
}

/** METHODS **/

/* GETTERS/SETTERS */

export function ObjectDeepPropertiesObservableGetProxy<TObject extends object>(instance: IObjectDeepPropertiesObservable<TObject>,): TObject {
  return (instance as IObjectDeepPropertiesObservableInternal<TObject>)[OBJECT_PROPERTIES_OBSERVABLE_PRIVATE].proxy;
}

/* METHODS */

export function ObjectDeepPropertiesObservableObserveProperty<TObject extends object, TValue>(
  instance: IObjectDeepPropertiesObservable<TObject>,
  path: Iterable<PropertyKey>,
  callback: (value: TValue) => void
): IObjectDeepPropertyObserver<TValue> {
  return new ObjectDeepPropertyObserver<TValue>(path, callback).observe(instance);
}



/** CLASS **/

export class ObjectDeepPropertiesObservable<TObject extends object> extends Observable<IObjectDeepProperty<any>> implements IObjectDeepPropertiesObservable<TObject> {
  constructor(object: TObject) {
    let context: IObservableContext<IObjectDeepProperty<any>>;

    super((_context: IObservableContext<IObjectDeepProperty<any>>) => {
      context = _context;
      return {
        onObserved: (observer: IObserver<IObjectDeepProperty<any>>): void => {
          ObjectDeepPropertiesObservableOnObserved<TObject>(this, observer);
        },
        onUnobserved: (observer: IObserver<IObjectDeepProperty<any>>): void => {
          ObjectDeepPropertiesObservableOnUnobserved<TObject>(this, observer);
        }
      };
    });

    // @ts-ignore
    ConstructObjectDeepPropertiesObservable<TObject>(this, context, object);
  }

  get proxy(): TObject {
    return ObjectDeepPropertiesObservableGetProxy<TObject>(this);
  }

  observeProperty<TValue>(path: Iterable<PropertyKey>, callback: (value: TValue) => void): IObjectDeepPropertyObserver<TValue> {
    return ObjectDeepPropertiesObservableObserveProperty<TObject, TValue>(this, path, callback);
  }
}


/*-----------------------*/

/**
 * WIP building ObjectObservable
 * TODO: add the distinct value code
 * TODO: prepare and think for full object path
 */

export async function debugObjectDeepPropertiesObservable() {
  const array = [0, 1, 2];
  const obj: any = {
    array: array,
    a: {
      a1: 'p-a-a1',
      a2: array,
    }
  };
  obj.obj = obj;

  const observable = new ObjectDeepPropertiesObservable(obj);

  observable.observeProperty(['array', 0], (value: number) => {
    console.log('obj.array[0] changed =>', value);
  }).activate();

  observable.observeProperty(['a', 'a2', 0], (value: number) => {
    console.log('obj.a.a2[0] changed =>', value);
  }).activate();

  // observable.observeProperty(3, (value: number) => {
  //   console.log('3 changed =>', value);
  // }).activate();
  //
  // observable.observeProperty('length', (value: number) => {
  //   console.log('length changed =>', value);
  // }).activate();

  observable.proxy.array[0] = 5;
  // // observable.proxy[0] = 6;
  // observable.proxy[6] = 6;

}
