import {
  DEEP_MAP_PRIVATE, DeepMap, DeepMapEntries, DeepMapGetPartial, IDeepMap, IDeepMapInternal
} from '../../classes/DeepMap';
import {
  Expression, IObservable, IObservableContext, ISource, Observable, Source, DistinctValueObservable,
  IDistinctValueObservableContext, Pipe, TPipeBase, TPipeContextBase, IsObservable, IObserver, Observer,
  IDistinctValueObservable
} from '@lifaon/observables';
import { IsObject } from '../../misc/helpers/is/IsObject';
import { assert, eq } from '../../classes/asserts';
import { TObservableOrValue } from '@lifaon/observables/types/operators/shortcuts/types';

/**
 * INFO: 'get' properties (getter like array.length) cant be observed except by using Expression, because they may change at any time
 * INFO: 'set' properties (setter like array.length) may create side effects like updating other values, we should run a full object check/update after it
 * INFO: others properties may be observed when their value will change trough 'set' (assign)
 */

function ObjectPathGet<T>(obj: object, path: PropertyKey[]): T {
  for (let i = 0, l = path.length; i < l; i++) {
    obj = (obj as any)[path[i]];
  }
  return obj as any;
}

function ObjectPathSet<T>(obj: object, path: PropertyKey[], value: T): void {
  const last: number = path.length - 1;
  for (let i = 0; i < last; i++) {
    obj = (obj as any)[path[i]];
  }
  (obj as any)[last] = value;
}

function ObjectPathDelete(obj: object, path: PropertyKey[]): boolean {
  const last: number = path.length - 1;
  for (let i = 0; i < last; i++) {
    obj = (obj as any)[path[i]];
  }
  return delete ((obj as any)[last]);
}

function ObjectPathExists(obj: object, path: PropertyKey[]): boolean {
  for (let i = 0, l = path.length; i < l; i++) {
    if (path[i] in obj) {
      obj = (obj as any)[path[i]];
    } else {
      return false;
    }
  }
  return true;
}

// IDEA create a function able to shorten object's property path in case of shared reference
// => no feasible

export function GetPropertyDescriptor<T>(target: object | null, propertyName: PropertyKey): TypedPropertyDescriptor<T> | undefined {
  while (target !== null) {
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target, propertyName);
    if (descriptor === void 0) {
      target = Object.getPrototypeOf(target);
    } else {
      return descriptor;
    }
  }
  return void 0;
}

/*-------------------*/

export interface IRevocableObservedProxy<T extends object> {
  proxy: T;
  revoke: () => T;
}

// source object to proxy
const OBJECT_OBSERVERS: WeakMap<object, IRevocableObservedProxy<object>> = new WeakMap<object, IRevocableObservedProxy<object>>();

function IsArrayIndex(propertyName: PropertyKey): number {
  if (typeof propertyName === 'symbol') {
    return -1;
  } else if (typeof propertyName === 'string') {
    propertyName = Number(propertyName);
  }

  return (Number.isInteger(propertyName) && (propertyName >= 0)) ? propertyName : -1;
}

/**
 * Creates a proxy which intercepts deeply when a property changes
 * WARN: getter are not taken in account !
 */
// TODO if old value is an object, we should revoke the object observer
// @example:
// const a = { a: { b: 'b' } };
// const b = a.a;
// a.a = 'new value';
// b.b = 'new b'; // problem because we are still observing 'b'

// TODO support shared references
// @example:
// const b = { b: 'b' };
// const a = { a1: b, a2: b };
// a.a2.b = 'c'; // problem because we are still observing 'b'

const OBJECT_TO_OBJECT_OBSERVERS_MAP: WeakMap<object, Set<ObjectObserver<object>>> = new WeakMap<object, Set<ObjectObserver<object>>>();

// map from a proxy to its target
const PROXY_TO_TARGET_MAP: WeakMap<any, any> = new WeakMap<any, any>();

export function GetProxyTarget<TObject extends object>(proxy: TObject): TObject {
  return PROXY_TO_TARGET_MAP.has(proxy)
    ? GetProxyTarget<TObject>(PROXY_TO_TARGET_MAP.get(proxy) as TObject)
    : proxy;
}

export function CreateProxy<TObject extends object>(target: TObject, handler: ProxyHandler<TObject>): TObject {
  const proxy: TObject = new Proxy<TObject>(target, handler);
  PROXY_TO_TARGET_MAP.set(proxy, target);
  return proxy;
}

/*-------------*/

export function CreateObjectPropertyObservable<TObject extends any, TPropertyKey extends PropertyKey>(target: TObject, propertyKey: TPropertyKey): IObservable<TObject[TPropertyKey]> {
  type TValue = TObject[TPropertyKey];

  const descriptor: TypedPropertyDescriptor<TValue> | undefined = GetPropertyDescriptor<TValue>(target, propertyKey);
  console.log(propertyKey, descriptor);
  let observable: IObservable<TValue>;

  if ((descriptor === void 0) || ('value' in descriptor)) {
    if ((descriptor !== void 0) && !descriptor.configurable) {
      observable = new Expression<TValue>(() => target[propertyKey]);
    } else {
      observable = new DistinctValueObservable<TValue>((context: IDistinctValueObservableContext<TValue>) => {
        return {
          onObserved(): void {
            if (context.observable.observers.length === 1) {
              let _value: any = target[propertyKey];
              Object.defineProperty(target, propertyKey, {
                configurable: true,
                enumerable: (descriptor === void 0) ? true : descriptor.enumerable,
                get: function() {
                  return _value;
                },
                set: function(value: TValue) {
                  _value = value;
                  context.emit(value);
                }
              });
              context.emit(_value);
            }
          },
          onUnobserved(): void {
            if (context.observable.observers.length === 1) {
              Object.defineProperty(target, propertyKey, {
                configurable: true,
                enumerable: (descriptor === void 0) ? true : descriptor.enumerable,
                value: target[propertyKey],
              });
            }
          }
        };
      });
    }
  } else if (typeof descriptor.get === 'function') {
    observable = new Expression<TValue>(() => target[propertyKey]);
    console.warn('Expression created');
  } else { // setter only
    observable = new Source<TValue>();
  }

  return observable;
}

const OBJECT_AND_PROPERTY_TO_OBSERVABLE_MAP: WeakMap<any, Map<PropertyKey, IObservable<any>>> = new WeakMap<any, Map<PropertyKey, IObservable<any>>>();

export function CreateUniqObjectPropertyObservable<TObject extends any, TPropertyKey extends PropertyKey>(target: TObject, propertyKey: TPropertyKey): IObservable<TObject[TPropertyKey]> {
  let map: Map<PropertyKey, IObservable<any>> | undefined = OBJECT_AND_PROPERTY_TO_OBSERVABLE_MAP.get(target);
  if (map === void 0) {
    map = new Map<PropertyKey, IObservable<any>>();
    OBJECT_AND_PROPERTY_TO_OBSERVABLE_MAP.set(target, map as Map<PropertyKey, IObservable<any>>);
  }

  let observable: IObservable<any> | undefined = (map as Map<PropertyKey, IObservable<any>>).get(propertyKey);
  if (observable === void 0) {
    observable = CreateObjectPropertyObservable<TObject, TPropertyKey>(target, propertyKey);
    (map as Map<PropertyKey, IObservable<any>>).set(propertyKey, observable as IObservable<any>);
  }

  return observable;
}


export function CreateObjectDeepPropertyObservable<TValue>(target: object, path: PropertyKey[]): IObservable<TValue> {
  if (path.length === 0) {
    throw new Error(`Expected at least one property in the path`);
  } else if (path.length === 1) {
    return CreateUniqObjectPropertyObservable(target, path[0]) as IObservable<TValue>;
  } else {
    const remainingPath: PropertyKey[] = path.slice(1);

    // returned observable
    let context: IDistinctValueObservableContext<TValue>;
    const observable: IDistinctValueObservable<TValue> = new DistinctValueObservable<TValue>((_context: IDistinctValueObservableContext<TValue>) => {
      context = _context;
      return {
        onObserved(): void {
          if (context.observable.observers.length === 1) {
            childPropertyValueObserver.activate();
            deepChildPropertyValueObserver.activate();
          }
        },
        onUnobserved(): void {
          if (!context.observable.observed) {
            childPropertyValueObserver.deactivate();
            deepChildPropertyValueObserver.deactivate();
          }
        },
      }
    });

    // observer observing the deep value
    const deepChildPropertyValueObserver: IObserver<any> = new Observer<any>((value: any) => {
      context.emit(value);
    });

    // observer observing target[path[0]]
    const childPropertyValueObserver = CreateUniqObjectPropertyObservable(target, path[0])
      .pipeTo((value: any) => {
        deepChildPropertyValueObserver.disconnect();
        if (IsObject(value)) {
          deepChildPropertyValueObserver.observe(CreateObjectDeepPropertyObservable(value, remainingPath));
        } else {
          deepChildPropertyValueObserver.emit(void 0);
        }
      });

    return observable;

    // const pipe: TPipeBase<any, any> = Pipe.create<any, any>((context: TPipeContextBase<any, any>) => {
    //   const valueObserver: IObserver<any> = new Observer<any>((value: any) => {
    //     context.emit(value);
    //   });
    //
    //   return {
    //     onEmit: (value: any) => {
    //       valueObserver.disconnect();
    //       if (IsObject(value)) {
    //         valueObserver.observe(CreateObjectDeepPropertyObservable(value, remainingPath));
    //       } else {
    //         valueObserver.emit(void 0);
    //       }
    //     },
    //     onObserved(): void {
    //       if (context.pipe.observable.observers.length === 1) {
    //         valueObserver.activate();
    //       }
    //     },
    //     onUnobserved(): void {
    //       if (!context.pipe.observable.observed) {
    //         valueObserver.deactivate();
    //       }
    //     },
    //   };
    // });
    //
    // pipe.observer.observe(CreateUniqObjectPropertyObservable(target, propertyKey));
    //
    // return pipe.observable;
  }
}


async function debugObjectPropertyObservable() {
  const obj: any = { a: 'a' };
  obj.obj = obj;

  const array = [0, 1, 2];

  // CreateUniqObjectPropertyObservable(obj, 'a')
  //   .pipeTo((value: any) => {
  //     console.log('object.a changed', value);
  //   }).activate();

  // CreateUniqObjectPropertyObservable(array, 0)
  //   .pipeTo((value: any) => {
  //     console.log('array[0] changed', value);
  //   }).activate();

  CreateUniqObjectPropertyObservable(array, 'length')
    .pipeTo((value: any) => {
      console.log('array.length changed', value);
    }).activate();

  // CreateUniqObjectPropertyObservable(array, '3')
  //   .pipeTo((value: any) => {
  //     console.log('array[3] changed', value);
  //   }).activate();

  // console.log('----');
  // obj.obj.obj.a = 'b';

  console.log('----');
  array[0] = 5;
  console.log('----');
  array.sort((a: number, b: number) => (b - a));
  // console.log('----');
  // array.push(8);
}

async function debugObjectDeepPropertyObservable() {
  const obj: any = { a: { b: 'b' }, arr: [0, 1, 2] };

  // CreateObjectDeepPropertyObservable(obj, ['a', 'b'])
  //   .pipeTo((value: any) => {
  //     console.log('object.a.b changed', value);
  //   }).activate();

  // CreateObjectDeepPropertyObservable(obj, ['a', 'b', 'c'])
  //   .pipeTo((value: any) => {
  //     console.log('object.a.b.c changed', value);
  //   }).activate();



  // console.log('----');
  // obj.a.b = 'c';
  // console.log('----');
  // obj.a = 'd';
  // console.log('----');
  // obj.a = { b: 'e' };
  // console.log('----');
  // obj.a.b = { c: 'f' };
}

/*-------------*/


export class ObjectPropertyObservable<TObject extends any, TPropertyKey extends PropertyKey> extends Observable<TObject[TPropertyKey]> {
  constructor(source: TObject, propertyName: TPropertyKey) {
    super((_context: IObservableContext<TObject[TPropertyKey]>) => {

    });
  }
}

export class ObjectObserver<T extends object> {

  // static create<T extends object>(
  //   source: T,
  //   onSet: (path: PropertyKey[], value: any) => void,
  //   onDelete: (path: PropertyKey[]) => void,
  //   path: PropertyKey[] = []
  // ): ObjectObserver<T> {
  //   return new ObjectObserver<any>(source, onSet, onDelete, path);
  // }

  public _source: T;
  public _proxy: T;
  // public _observers: Map<PropertyKey, ObjectObserver<any>>;
  public _observers: Map<PropertyKey, ISource<any>>;


  protected constructor(source: T = Object.create(null)) {
    this.source = source;
    this._observers = new Map<PropertyKey, ISource<any>>();

    // let observers: Set<ObjectObserver<object>>;
    // if (OBJECT_TO_OBJECT_OBSERVERS_MAP.has(this.source)) {
    //   observers = OBJECT_TO_OBJECT_OBSERVERS_MAP.get(this.source) as Set<ObjectObserver<object>>;
    // } else {
    //   observers = new Set<ObjectObserver<object>>();
    //   OBJECT_TO_OBJECT_OBSERVERS_MAP.set(this.source, observers);
    // }
    //
    // observers.add(this);
  }

  get source(): T {
    return this._source;
  }

  set source(value: T) {
    this._source = GetProxyTarget<T>(value);

    this._proxy = new Proxy(this._source, {
      get: (target: any, propertyName: PropertyKey, receiver: any): any => {
        return Reflect.get(target, propertyName, receiver);
      },
      set: (target: any, propertyName: PropertyKey, value: any, receiver: any) => {
        value = GetProxyTarget<any>(value);

        if (this._observers.has(propertyName)) {
          // const observer: ObjectObserver<any> = this._observers.get(propertyName);
        }
        // const _path: PropertyKey[] = path.concat(propertyName);

        if (IsObject(value)) {
          const observer: ObjectObserver<any> = new ObjectObserver<any>(value);
          value = observer.proxy;
          // map this observer with the appropriated property
        }

        // onSet(_path, value);

        return Reflect.set(target, propertyName, value, receiver);
      },
      deleteProperty: (target: any, propertyName: PropertyKey): boolean => {
        // onDelete(path.concat(propertyName));

        return Reflect.deleteProperty(target, propertyName);
      },
    });
  }

  get proxy(): T {
    return this._proxy;
  }

  observe<V>(path: PropertyKey[]): ISource<V> {
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


/*----------------------------*/


function CreateUniqObjectObserver<T extends object>(
  source: T,
  onSet: (path: PropertyKey[], value: any) => void,
  onDelete: (path: PropertyKey[]) => void,
  path: PropertyKey[] = []
): IRevocableObservedProxy<T> {

  let revoke: () => T = () => {
    return source;
  };

  const proxy: T = new Proxy(source, {
    get: (target: any, propertyName: PropertyKey, receiver: any): any => {
      return Reflect.get(target, propertyName, receiver);
    },
    set: (target: any, propertyName: PropertyKey, value: any, receiver: any) => {
      const _path: PropertyKey[] = path.concat(propertyName);

      if (IsObject(value)) {
        const _revocableProxy: IRevocableObservedProxy<any> = CreateUniqObjectObserver<any>(value, onSet, onDelete, _path);
        value = _revocableProxy.proxy;
        const _revoke = () => {
          revoke();
        };
      }

      onSet(_path, value);

      return Reflect.set(target, propertyName, value, receiver);
    },
    deleteProperty: (target: any, propertyName: PropertyKey): boolean => {
      onDelete(path.concat(propertyName));

      return Reflect.deleteProperty(target, propertyName);
    },
  });

  // for (const key in source) {
  //   Reflect.set(proxy as T, key, Reflect.get(source, key));
  // }

  return {
    proxy,
    revoke
  };
}


class DataProxy<T extends object> {
  private _data: T;
  private _observables: IDeepMap<ISource<any>>;
  private _autoUpdateTimer: any | null;

  constructor(source: T = Object.create(null)) {
    this._observables = new DeepMap<ISource<any>>();
    this._autoUpdateTimer = null;
    this.data = source;
  }

  get data(): T {
    return this._data;
  }

  set data(value: T) {
    this._data = CreateUniqObjectObserver<T>(value, (path: any[], value: any) => {
      console.warn('set', path, value);
      // this._emit(path, value);
    }, (path: any[]) => {
      console.warn('delete', path);
      // this._emit(path, void 0);
    }).proxy;

    // this._emit([], this._data);
  }

  // get template(): any {
  //   return new Proxy(Object.create(null), {
  //     get: (target: any, propertyName: PropertyKey) => {
  //       return Reflect.get(target);
  //     },
  //     set: (target: any, propertyName: PropertyKey, value: any) => {
  //       ObjectPathSet<any>((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy, path.concat(propertyName), value);
  //       return true;
  //     },
  //     deleteProperty: (target: any, propertyName: PropertyKey): boolean => {
  //       return ObjectPathDelete((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy, path.concat(propertyName));
  //     },
  //     ownKeys: () => {
  //       return Object.keys(ObjectPathGet((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy, path));
  //     }, // https://stackoverflow.com/questions/40352613/why-does-object-keys-and-object-getownpropertynames-produce-different-output
  //     getOwnPropertyDescriptor: () => {
  //       return {
  //         enumerable: true,
  //         configurable: true,
  //       };
  //     }
  //   });
  // }

  observe<V>(path: PropertyKey[]): ISource<V> {
    // TODO check if property is a getter, if yes, creates an Expression
    path = this._normalizePath(path);
    let source: ISource<V> | undefined = this._observables.get(path) as (ISource<V> | undefined);
    if (source === void 0) {
      source = new Source<V>().emit(this.get(path));
      this._observables.set(path, source);
    }
    return source;
  }

  unobserve(path: PropertyKey[]): boolean {
    return this._observables.delete(this._normalizePath(path));
  }

  get<V>(path: PropertyKey[]): V {
    return ObjectPathGet(this._data, path);
  }

  set(path: PropertyKey[], value: any): void {
    ObjectPathSet(this._data, path, value);
  }

  update(): void {
    const iterator: Iterator<[any[], ISource<any>]> = this._observables.entries();
    let result: IteratorResult<[any[], ISource<any>]>;
    while (!(result = iterator.next()).done) {
      const [path, source] = result.value;
      if (ObjectPathExists(this._data, path)) {
        source.emit(ObjectPathGet(this._data, path));
      } else {
        source.emit(void 0);
      }
    }
  }

  startAutoUpdate(): void {
    if (this._autoUpdateTimer === null) {
      const loop = () => {
        this.update();
        this._autoUpdateTimer = setTimeout(loop, 1000);
      };

      loop();
    }
  }

  stopAutoUpdate(): void {
    if (this._autoUpdateTimer !== null) {
      clearTimeout(this._autoUpdateTimer);
      this._autoUpdateTimer = null;
    }
  }

  private _normalizePath(path: PropertyKey[]): PropertyKey[] {
    return path.map((key: PropertyKey) => {
      return (typeof key === 'number') ? String(key) : key;
    });
  }

  private _emit(path: any[], value: any): void {
    const map: Map<any, any> = ((this._observables as unknown) as IDeepMapInternal<ISource<any>>)[DEEP_MAP_PRIVATE].map;
    let entry: Map<any, any> | ISource<any> | undefined = DeepMapGetPartial(map, path);
    if (entry === void 0) {
      // do nothing
    } else if (entry instanceof Map) {
      // console.warn(entry, path);
      const iterator: IterableIterator<[any[], ISource<any>]> = DeepMapEntries(entry);
      let result: IteratorResult<[any[], ISource<any>]>;
      while (!(result = iterator.next()).done) {
        // console.warn(result.value[0]);
        result.value[1].emit(
          (IsObject(value) && ObjectPathExists(value, result.value[0]))
            ? ObjectPathGet(value, result.value[0])
            : ((result.value[0].length === 0) ? value : void 0)
        );
      }
    } else {
      entry.emit(value);
    }
  }
}


/*----------------------------*/

async function debugObjectObserver() {
  const data = CreateUniqObjectObserver<any>({}, (path: any[], value: any) => {
    console.warn('set', path, value);
  }, (path: any[]) => {
    console.warn('delete', path);
  }).proxy;

  console.log('-----');
  const a = { b: 'b' };
  data.a1 = a;
  data.a2 = a;
  data.a3 = data.a1;
  console.log('-----');
  data.a2.b = 'c'; // must update data.a1.b, data.a2.b, data.a3.b
}

async function debugObject() {
  const data = new DataProxy<any>({
    c: {
      a: 'c-a-1',
    }
  });

  await assert(() => (typeof data.data.c === 'object'));
  await assert(() => ('c' in data.data));
  await assert(() => eq(Object.keys(data.data), ['c']));

  console.log('-------------------------');


  data.observe(['c'])
    .pipeTo((value: any) => {
      console.log('c changed', value);
    }).activate();

  data.observe(['c', 'a'])
    .pipeTo((value: any) => {
      console.log('c.a changed', value);
    }).activate();

  // console.log('-----');
  // const c = data.data.c;
  // data.data.c = 'abc';
  // c.a = 'a';

  console.log('-----');
  const b = { b: 'b' };
  data.data = { a1: b, a2: b };
  console.log('-----');
  data.data.a2.b = 'c'; // problem because we are still observing 'b'

//   data.data.c.a = 'c-a-2'; // c.a => c-a-2
//   data.data.c = { a: 'c-a-3' }; // c.a => c-a-3, c => { a: 'c-a-3' }
//   data.data.c = 'c'; // c => c, c.a => void 0
//   data.data.c = { a: 'c-a-4' }; // c => { a: 'c-a-4' }, c.a => c-a-4
//   delete (data.data.c.a); // c.a => void 0
//   data.data.c = { a: 'c-a-5' }; // c => { a: 'c-a-5' }, c.a => c-a-5
//   delete (data.data.c); // void 0 => c, c.a => void 0
//   data.data.c = { a: 'c-a-6' }; // c => { a: 'c-a-6' }, c.a => c-a-6
//   data.data = {}; // void 0 => c, c.a => void 0
}

async function debugArray() {
  const data = new DataProxy<any>({
    c: ['c0', 'c1', 'c2']
  });


  await assert(() => (typeof data.data.c === 'object'));
  await assert(() => ('c' in data.data));
  await assert(() => eq(Object.keys(data.data), ['c']));
  await assert(() => Array.isArray(data.data.c));
  await assert(() => ('slice' in data.data.c));

  console.log('-------------------------');

  // data.startAutoUpdate();

  data.observe(['c'])
    .pipeTo((value: any) => {
      console.log('c changed', value);
    }).activate();

  data.observe(['c', 0])
    .pipeTo((value: any) => {
      console.log('c[0] changed', value);
    }).activate();

  data.observe(['c', 'length'])
    .pipeTo((value: any) => {
      console.log('c.length changed', value);
    }).activate();

  console.log('-----');
  data.data.c[0] = 'c0-2'; // c[0] => c0-2
  // console.log('-----');
  // data.data.c[10] = 'c10-0'; // c[0] => c0-2
  // console.log('c.length', data.data.c.length);
  // console.log('-----');
  // data.data.c = ['c0-3', 'c1-3']; // c[0] => c0-3, c => ['c0-3', 'c1-3']
  // console.log('-----');
  // data.data.c = 'c'; // c => c, c[0] => void 0
  // console.log('-----');
  // data.data.c = ['c0-4', 'c1-4']; // c[0] => c0-4, c => ['c0-4', 'c1-4']
  // console.log('-----');
  // data.data.c.shift(); // c[0] => c1-4
  // console.log('-----');
  // data.data.c.unshift('c-unshift'); // c[0] => c-unshift
  // console.log('-----');
  // data.data.c.length = 0; // WARN problem
  // console.log('-----');
  // data.data.c = []; // c[0] => void 0
  // console.log('-----');
  // data.data.c.push('c-push'); // c[0] => c-push
  // console.log('-----');
  // data.data.c = [2, 1]; // c[0] => 2, c => [2, 1]
  // console.log('-----');
  // data.data.c.sort(); // c[0] => 1
}


export async function debugDataProxy() {
  await debugObjectPropertyObservable();
  // await debugObjectDeepPropertyObservable();
  // await debugObjectObserver();
  // await debugObject();
  // await debugArray();
}
