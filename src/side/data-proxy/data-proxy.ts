import {
  Expression, INotificationsObservable, INotificationsObservableContext, INotificationsObserver, IObservable, IObserver,
  IsNotificationsObserver, NotificationsObservable
} from '@lifaon/observables';
import { GetPropertyDescriptor } from '../../misc/helpers/object-helpers';
import { debugObjectPropertiesObservable } from './object-properties-observable/implementation';

/**
 * INFO: 'get' properties (getter like array.length) cant be observed except by using Expression, because they may change at any time
 * INFO: 'set' properties (setter like array.length) may create side effects like updating other values, we should run a full object check/update after it
 * INFO: others properties may be observed when their value will change trough 'set' (assign)
 */


// IDEA create a function able to shorten object's property path in case of shared reference
// => no feasible

export function IsArrayIndex(propertyName: PropertyKey): number {
  if (typeof propertyName === 'symbol') {
    return -1;
  } else if (typeof propertyName === 'string') {
    propertyName = Number(propertyName);
  }

  return (Number.isInteger(propertyName) && (propertyName >= 0)) ? propertyName : -1;
}


/*-------------------*/

/* Observes changes by creating a proxy and listening to getters and setters */

export interface IObjectProxyObservableKeyValueMap {
  [key: string]: any;
}

export interface IProxyAndObservable<TObject> {
  proxy: TObject;
  observable: INotificationsObservable<IObjectProxyObservableKeyValueMap>;
}

export interface IResolvedProperty {
  dynamic: boolean; // true if the value may change at any time (because it's a getter)
  count: number; // number of observers observing this property
  observer?: IObserver<any>; // an observer observing a dynamic value
}


export function PatchArrayProxy(target: any[], propertyKey: PropertyKey, value: any, receiver: any[]): void {
  if (propertyKey === 'length') {
    if (value > target.length) {
      for (let i = target.length; i < value; i++) {
        receiver[i] = void 0;
      }
    } else if (value < target.length) {
      for (let i = value; i < target.length; i++) {
        delete receiver[i];
      }
    }
    // for (let i = Math.min(target.length, value), l = Math.max(target.length, value); i < l; i++) {
    //   receiver[i] = void 0;
    // }
  } else {
    const index: number = IsArrayIndex(propertyKey);
    for (let i = target.length; i < index; i++) {
      receiver[i] = void 0;
    }
  }
}

// --> CURRENT BEST SOLUTION
/**
 * INFO: covers most of the cases
 * PROBLEM: setters and getters may have unexpected side effects like array.length = 0,
 *  this result in practice to the impossibility to check completely an object update based on the Proxy
 */
export function CreateObjectProxyObservable<TObject extends object>(source: TObject): IProxyAndObservable<IObjectProxyObservableKeyValueMap> {
  let context: INotificationsObservableContext<IObjectProxyObservableKeyValueMap>;
  let revoked: boolean = false;

  // info: receiver is the proxy
  const { proxy, revoke } = Proxy.revocable<TObject>(source, {
    get: (target: any, propertyKey: PropertyKey, receiver: any): any => {
      return Reflect.get(target, propertyKey, receiver);
    },
    set: (target: any, propertyKey: PropertyKey, value: any, receiver: any) => {
      if (Array.isArray(target)) {
        PatchArrayProxy(target, propertyKey, value, receiver);
      }
      const succeed: boolean = Reflect.set(target, propertyKey, value, receiver);
      if (succeed) {
        // console.log(propertyKey, target[propertyKey], value);
        context.dispatch(propertyKey as string, target[propertyKey]);
      }
      return succeed;
    },
    deleteProperty: (target: any, propertyKey: PropertyKey): boolean => {
      const succeed: boolean = Reflect.deleteProperty(target, propertyKey);
      if (succeed) {
        context.dispatch(propertyKey as string, target[propertyKey]);
      }
      return succeed;
    },
  });

  const _revoke = () => {
    // maybe clear 'observers'
    revoked = true;
    revoke();
  };

  // list of observed properties, where their type has been resolved
  const resolvedProperties: Map<PropertyKey, IResolvedProperty> = new Map<PropertyKey, IResolvedProperty>();

  const onObserve = (observer: INotificationsObserver<string, any>) => { // new NotificationsObserver
    const propertyKey: PropertyKey = observer.name;

    if (resolvedProperties.has(propertyKey)) {
      const resolvedProperty: IResolvedProperty = (resolvedProperties.get(propertyKey) as IResolvedProperty);
      resolvedProperty.count++;

      if (resolvedProperty.dynamic) {
        (resolvedProperty.observer as IObserver<any>).activate();
      }
    } else {
      // must resolved the kind of the property
      const descriptor: TypedPropertyDescriptor<any> | undefined = GetPropertyDescriptor<any>(source, propertyKey);

      let childObserver: IObserver<any> | undefined;
      const isDynamicProperty: boolean = ((descriptor !== void 0) && (typeof descriptor.get === 'function'));

      if (isDynamicProperty) { // may only be read through Expression
        childObserver = new Expression<any>(() => proxy[propertyKey])
          .pipeTo((value: any) => {
            context.dispatch(propertyKey as string, value);
          }).activate();
      } else {
        observer.callback.call(observer, proxy[propertyKey]);
      }

      resolvedProperties.set(propertyKey, {
        dynamic: isDynamicProperty,
        observer: childObserver,
        count: 1,
      });
    }
  };

  const onUnobserve = (observer: INotificationsObserver<string, any>) => {
    const propertyKey: PropertyKey = observer.name;
    if (resolvedProperties.has(propertyKey)) {
      const resolvedProperty: IResolvedProperty = (resolvedProperties.get(propertyKey) as IResolvedProperty);
      resolvedProperty.count--;
      if (resolvedProperty.dynamic && (resolvedProperty.count === 0)) {
        (resolvedProperty.observer as IObserver<any>).deactivate();
      }
    }
  };


  const observable = new NotificationsObservable<IObjectProxyObservableKeyValueMap>((_context: INotificationsObservableContext<IObjectProxyObservableKeyValueMap>) => {
    context = _context;
    return {
      onObserved(observer: IObserver<any>): void {
        if (revoked) {
          throw new Error(`The proxy has been revoked`);
        } else {
          if (IsNotificationsObserver(observer)) {
            onObserve(observer);
          }/* else {
            throw new Error(`This observable may only be observed by a NotificationsObserver`);
          }*/
        }
      },
      onUnobserved(observer: IObserver<any>): void {
        if (revoked) {
          throw new Error(`The proxy has been revoked`);
        } else {
          if (IsNotificationsObserver(observer)) {
            onUnobserve(observer);
          }/* else {
            throw new Error(`This observable may only be unobserved by a NotificationsObserver`);
          }*/

          if (!context.observable.observed) {
            _revoke();
          }
        }
      },
    };
  });

  return {
    proxy,
    observable,
  };
}

async function debugObjectProxyObservable() {
  const array = [0, 1, 2];

  const { proxy, observable } = CreateObjectProxyObservable(array);

  observable
    .on('length', (value: any) => {
      console.log('array.length changed', value);
    })
    .on('0', (value: any) => {
      console.log('array[0] changed', value);
    })
    .on('3', (value: any) => {
      console.log('array[3] changed', value);
    })
  ;

  // console.log('---- proxy[0] = 5');
  // proxy[0] = 5;
  // console.log('---- sort');
  // proxy.sort((a: number, b: number) => (a - b));
  // // console.log(Array.from(proxy as any));
  // console.log('---- proxy.push(8)');
  // proxy.push(8);
  // console.log('---- proxy.pop()');
  // proxy.pop();
  // console.log('---- proxy[4] = 4');
  // proxy[4] = 4; // WARN: problem because proxy[3] is not filled with void 0 => requires patch
  // console.log('---- proxy.length = 5');
  // proxy.length = 5; // WARN: problem because proxy[3] is not filled with void 0 => requires patch
  console.log('---- proxy.length = 0');
  proxy.length = 0; // WARN: problem because proxy[0] is not marked as deleted => requires patch

  (window as any).proxy = proxy;
}


/*----------------------------------------------------------------------------------------------------------------*/

export class ObjectObserver<TObject extends object> {

  constructor(value?: TObject) {
  }


  observe<V>(path: PropertyKey[]): IObservable<V> {
    // TODO check if property is a getter, if yes, creates an Expression
    path = this._normalizePath(path);
    if (path.length > 0) {

    }
    throw 'TODO';
    // let source: ISource<V> | undefined = this._observables.get(path) as (ISource<V> | undefined);
    // if (source === void 0) {
    //   source = new Source<V>().emit(this.get(path));
    //   this._observables.set(path, source);
    // }
    // return source;
  }

  // activate(): this {
  //   return this;
  // }
  //
  // deactivate(): this {
  //   return this;
  // }

  unobserveAll(): void {

  }

  protected _normalizePath(path: PropertyKey[]): PropertyKey[] {
    return path.map((key: PropertyKey) => {
      return (typeof key === 'number') ? String(key) : key;
    });
  }
}


/*----------------------------------------------------------------------------------------------------------------*/

export async function debugDataProxy() {
  // await debugObjectProxyObservable();
  await debugObjectPropertiesObservable();
}
