import { ISource } from '../../observables/source/interfaces';
import { Source } from '../../observables/source/implementation';
import { DEEP_MAP_PRIVATE, DeepMap, DeepMapEntries, DeepMapGetPartial, DeepMapValues, IDeepMap, IDeepMapInternal } from '../classes/DeepMap';
import { ConstructClassWithPrivateMembers } from '../../misc/helpers/ClassWithPrivateMembers';

function testSourceProxyOld(): void {

  class SourceProxy {
    public readonly sources: Map<string, ISource<any>>;

    public readonly templateProxy: any;
    public readonly dataProxy: any;

    constructor() {
      this.sources = new Map<string, ISource<any>>();
      this.templateProxy = this._createTemplateProxy('');
      this.dataProxy = this._createDataProxy('');
    }

    protected _setValue(path: string, propertyName: string, value: any): boolean {
      if (propertyName.startsWith('$$')) {
        throw new Error(`Cannot set a property starting with $$`);
      } else {
        const _path: string = path + '.' + propertyName;
        if (this.sources.has(_path)) {
          const sourceValue = this.sources.get(_path).value;
          if ((typeof sourceValue === 'object') && (sourceValue !== null)) {
            for (const prop of Object.keys(sourceValue)) {
              sourceValue[prop] = void 0;
            }
          }
        } else {
          const source: ISource<any> = new Source();
          this.sources.set(_path, source);
        }

        if ((typeof value === 'object') && (value !== null)) {
          Object.freeze(value);
          const proxyObject = this._createDataProxy(_path);
          for (const prop of Object.keys(value)) {
            proxyObject[prop] = value[prop];
          }
          value = proxyObject;
        }
        this.sources.get(_path).emit(value);
        return true;
      }
    }

    protected _ownKeys(path: string): PropertyKey[] {
      const keys: Set<string> = new Set<string>();
      for (const key of this.sources.keys()) {
        if (key.startsWith(path)) {
          const _key: string = key.slice(path.length + 1).split('.')[0];
          if (_key !== '') {
            keys.add(_key);
          }
        }
      }
      return Array.from(keys);
    }

    protected _createTemplateProxy(path: string): any {
      return new Proxy(Object.create(null), {
        get: (target: any, propertyName: string) => {
          if (propertyName.startsWith('$$')) {
            if (!this.sources.has(path)) {
              const source: ISource<any> = new Source();
              this.sources.set(path, source);
            }
            return this.sources.get(path);
          } else {
            return this._createTemplateProxy(path + '.' + propertyName);
          }
        },
        set: (target: any, propertyName: string, value: any) => {
          return this._setValue(path, propertyName, value);
        },
        ownKeys: () => {
          return this._ownKeys(path);
        }, // https://stackoverflow.com/questions/40352613/why-does-object-keys-and-object-getownpropertynames-produce-different-output
        getOwnPropertyDescriptor() {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      });
    }

    protected _createDataProxy(path: string): any {
      return new Proxy(Object.create(null), {
        get: (target: any, propertyName: string) => {
          if (propertyName.startsWith('$$')) {
            throw new Error(`Cannot get a property starting with $$`);
          } else {
            const _path: string = path + '.' + propertyName;
            if (this.sources.has(_path)) {
              return this.sources.get(_path).value;
            } else {
              return void 0;
            }
          }
        },
        set: (target: any, propertyName: string, value: any) => {
          return this._setValue(path, propertyName, value);
        },
        deleteProperty: (target: any, propertyName: string) => {
          return this._setValue(path, propertyName, void 0);
        },
        ownKeys: () => {
          return this._ownKeys(path);
        },
        getOwnPropertyDescriptor() {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      });
    }

  }

  const proxy = new SourceProxy();

  proxy.templateProxy.a.$$.pipe((value: any) => {
    if (value) {
      console.log('a emit', value.b);
    }
  }).activate();

  proxy.templateProxy.a.b.$$.pipe((value: any) => {
    console.log('b emit', value);
  }).activate();

  const b = { b: true };
  // proxy.templateProxy.a = 1;
  // proxy.templateProxy.b = 1;

  // proxy.templateProxy.a = b; // b emit true, a emit { b: true }
  // proxy.templateProxy.a.b = false; // b emit false
  proxy.templateProxy.a = { b: '5' }; // b emit '5', a emit { b: '5'' }
  proxy.templateProxy.a = { }; // b emit '5', a emit { b: '5'' }

  (window as any).templateProxy = proxy.templateProxy;
  (window as any).dataProxy = proxy.dataProxy;


  // interface Form {
  //   language: {
  //     code: '',
  //     title: ''
  //   },
  //   emails: '',
  //   subject: '',
  //   clientName: '',
  //   salesRep: {
  //     name: '',
  //     email: ''
  //   },
  //   boutique: {
  //     name: '',
  //     address: '',
  //     number: ''
  //   }
  // }
  //
  // interface Response {
  //   fields: Form; // default values
  //   body: string; // template: "Dear M {{ clientName }}, ... {{ boutique.name }} ... {{ salesRep.name}} ... "
  // }
}




function CreateTemplateProxy(sources: Map<string, ISource<any>>): any {
  return new Proxy(Object.create(null), {
    get: (target: any, propertyName: string) => {
      console.log('get', propertyName);
      if (propertyName.startsWith('$$')) {
        if (sources.has(propertyName)) {
          return sources.get(propertyName);
        } else {
          const source: ISource<any> = new Source<any>();
          sources.set(propertyName, source);
          return source;
        }

      } else {
        return CreateTemplateProxy;
      }
    },
    // set: (target: any, propertyName: string, value: any) => {
    //   return this._setValue(path, propertyName, value);
    // },
    // ownKeys: () => {
    //   return this._ownKeys(path);
    // }, // https://stackoverflow.com/questions/40352613/why-does-object-keys-and-object-getownpropertynames-produce-different-output
    // getOwnPropertyDescriptor() {
    //   return {
    //     enumerable: true,
    //     configurable: true,
    //   };
    // }
  });
}

function CreateDataProxy(data: any): any {
  const dataProxy = new Proxy(data, {
    get: (target: any, propertyName: string): any => {
      console.log('get', propertyName);
      return Reflect.get(target, propertyName);
    },
    set: (target: any, propertyName: string, value: any): boolean => {
      return Reflect.set(target, propertyName, value);
    },
    deleteProperty: (target: any, propertyName: string): boolean => {
      return Reflect.deleteProperty(target, propertyName);
    },
  });

  // const sources: { [key: string]: ISource<any> } = {};
  // const sourceProxy = new Proxy(sources, {
  //   get: (target: any, propertyName: string): any => {
  //     console.log('get source', propertyName);
  //     if (propertyName.startsWith('$$')) {
  //       if (!this.sources.has(path)) {
  //         const source: ISource<any> = new Source();
  //         this.sources.set(path, source);
  //       }
  //       return this.sources.get(path);
  //     } else {
  //       return this._createTemplateProxy(path + '.' + propertyName);
  //     }
  //   },
  //   set: (target: any, propertyName: string, value: any): boolean => {
  //     return Reflect.set(target, propertyName, value);
  //   },
  //   deleteProperty: (target: any, propertyName: string): boolean => {
  //     return Reflect.deleteProperty(target, propertyName);
  //   },
  // });

  return [dataProxy];
}


interface IItemsList {
  items: ISource<IItem>;
}

interface IItem {
  images: ISource<IImage>;
}

interface IImage {
  src: ISource<string>;
}


/*------------------------------*/

// type SourceCast<T extends object> = {
//   [P in keyof T]: ISource<T[P]>;
// };

type SourceObject<T extends object> = {
  [P in keyof T]: T[P] extends object ? ISource<SourceObject<T[P]>> : ISource<T[P]>;
};





function CastObjectToSourceObject<T extends object>(obj: T, sourceObject: SourceObject<T> = {} as SourceObject<T>): SourceObject<T> {
  // https://jsperf.com/hasownproperty-vs-in-vs-undefined/12
  // https://jsperf.com/object-keys-foreach-vs-for-in-v2/2
  const keys: string[] = Object.keys(obj);
  let key: string;
  for (let i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    if ((sourceObject as any)[key] === void 0) {
      (sourceObject as any)[key] = new Source<any>().emit(
        (typeof (obj as any)[key] === 'object')
          ? CastObjectToSourceObject((obj as any)[key])
          : (obj as any)[key]
      );
    } else {
      // TODO diff
      // if ((sourceObject as any)[key].value !== (obj as any)[key])

      (sourceObject as any)[key].emit(
        (typeof (obj as any)[key] === 'object')
          ? CastObjectToSourceObject((obj as any)[key], (sourceObject as any)[key].value)
          : (obj as any)[key]
      );
    }
  }
  return sourceObject;
}


function testSourceObject() {
  interface A {
    a: string;
    b: string[];
    c: {
      a: string;
    };
  }

  const a: A = {
    a: 'a',
    b: ['b1', 'b2'],
    c: {
      a: 'c-a',
    }
  };

  const src: SourceObject<A> = CastObjectToSourceObject<A>(a);
  src.b.value[0].emit('b3');
  src.c.value.a.emit('c-a2');

}





/*------------------------------*/

function BuildSourceMap(obj: object, sourceMap: DeepMap<ISource<any>> = new DeepMap<ISource<any>>(), path: string[] = []): DeepMap<ISource<any>> {
  const keys: string[] = Object.keys(obj);
  let key: string, value: any;
  for (let i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    value = (obj as any)[key];
    const _path: string[] = path.concat(key);
    let source: ISource<any> | undefined = sourceMap.get(_path);
    if (source === void 0) {
      source = new Source<any>();
      sourceMap.set(_path, source);
    }

    source.emit(value);

    if (typeof value === 'object') {
      BuildSourceMap(value, sourceMap, _path);
    }
  }
  return sourceMap;
}

function NormalizeObjectPath(key: string): string {
  return key.replace(/\[(["']?)(.*?)\1\]/g, '.$2');
}


function testSourceObject2() {

  interface A {
    a: string;
    b: string[];
    c: {
      a: string;
    };
  }

  const a: A = {
    a: 'a',
    b: ['b0', 'b1'],
    c: {
      a: 'c-a',
    }
  };

  const sources: DeepMap<ISource<any>> = BuildSourceMap(a); // from a
  sources.get(['b', '0'])
    .pipeTo((value: any) => {
      console.log('emit', value);
    }).activate();

  // console.log(sources.get(['a']).value);
  // console.log(sources.get(['b', '0']).value);

  a.b[0] = 'b2';
  BuildSourceMap(a, sources);

  // sources.get('b[0]');
  // sources.get('c.a');
}

/*------------------------------*/



class TempMap<K, V> {
  private readonly _period: number;
  private readonly _map: Map<K, V>;
  private readonly _timers: Map<K, any>;

  constructor(period: number = 60000) {
    this._period = period;
    this._map = new Map<K, V>();
    this._timers = new Map<K, V>();
  }

  clear(): void {
    return this._map.clear();
  }

  delete(key: K): boolean {
    this._clearTimer(key);
    return this._map.delete(key);
  }

  forEach(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    const _this_ = this;
    return this._map.forEach(function (value: V, key: K, map: Map<K, V>) {
      _this_._resetTimer(key);
      callback.call(this, value, key, map);
    }, thisArg);
  }

  get(key: K): V | undefined {
    this._resetTimer(key);
    return this._map.get(key);
  }

  has(key: K): boolean {
    this._resetTimer(key);
    return this._map.has(key);
  }

  set(key: K, value: V): this {
    this._startTimer(key);
    this._map.set(key, value);
    return this;
  }

  * [Symbol.iterator](): IterableIterator<[K, V]> {
    for (const [key, value] of this._map[Symbol.iterator]()) {
      this._resetTimer(key);
      yield [key, value];
    }
  }

  * entries(): IterableIterator<[K, V]> {
    for (const [key, value] of this._map.entries()) {
      this._resetTimer(key);
      yield [key, value];
    }
  }

  * keys(): IterableIterator<K> {
    for (const key of this._map.keys()) {
      this._resetTimer(key);
      yield key;
    }
  }

  * values(): IterableIterator<V> {
    for (const [key, value] of this._map.entries()) {
      this._resetTimer(key);
      yield value;
    }
  }


  protected _resetTimer(key: K): void {
    const timer: any = this._timers.get(key);
    if (timer !== void 0) {
      clearTimeout(timer);
      this.__setTimer(key);
    }
  }

  protected _startTimer(key: K): void {
    const timer: any = this._timers.get(key);
    if (timer !== void 0) {
      clearTimeout(timer);
    }
    this.__setTimer(key);
  }

  protected __setTimer(key: K): void {
    this._timers.set(key, setTimeout(() => {
      this._timers.delete(key);
      this._map.delete(key);
    }, this._period));
  }

  protected _clearTimer(key: K): void {
    const timer: any = this._timers.get(key);
    if (timer !== void 0) {
      clearTimeout(timer);
      this._timers.delete(key);
    }
  }
}




/*------------------------------*/

function IsPrimitive(value: any): boolean {
  switch (typeof value) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'symbol':
      return true;
    case 'object':
      return value === null;
    case 'function':
    case 'bigint':
      return false;
    default:
      throw new TypeError(`Unknown type: ${typeof value}`);
  }
}


function CloneObjectPropertiesOwnKeys<T extends object>(destination: T, source: T, depth: number = 0, verify: boolean = false): T {
  return verify
    ? CloneObjectPropertiesOwnKeysVerify(destination, source, depth)
    : CloneObjectPropertiesOwnKeysNoVerify(destination, source, depth);
}

function CloneObjectPropertiesAllKeys<T extends object>(destination: T, source: T, depth: number = 0, verify: boolean = false): T {
  return verify
    ? CloneObjectPropertiesAllKeysVerify(destination, source, depth)
    : CloneObjectPropertiesAllKeysNoVerify(destination, source, depth);
}

function CloneObjectPropertiesOwnKeysVerify<T extends object>(destination: T, source: T, depth: number = 0): T {
  if (depth > 0) {
    const depthMinusOne: number = depth - 1;
    const keys: string[] = Object.keys(source);
    let key: string;
    for (let i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      const value: any = (source as any)[key];
      const cloned: any = Clone(value, depthMinusOne);
      (destination as any)[key] = cloned;
      if ((destination as any)[key] !== cloned) {
        throw new Error(`Failed to set property '${key}'`);
      }
    }
  } else {
    const keys: string[] = Object.keys(source);
    let key: string;
    for (let i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      const value: any = (source as any)[key];
      (destination as any)[key] = value;
      if ((destination as any)[key] !== value) {
        throw new Error(`Failed to set property '${key}'`);
      }
    }
  }
  return destination;
}

function CloneObjectPropertiesAllKeysVerify<T extends object>(destination: T, source: T, depth: number = 0): T {
  if (depth > 0) {
    const depthMinusOne: number = depth - 1;
    for (const key in source) {
      const value: any = (source as any)[key];
      const cloned: any = Clone(value, depthMinusOne);
      (destination as any)[key] = cloned;
      if ((destination as any)[key] !== cloned) {
        throw new Error(`Failed to set property '${key}'`);
      }
    }
  } else {
    for (const key in source) {
      const value: any = (source as any)[key];
      (destination as any)[key] = value;
      if ((destination as any)[key] !== value) {
        throw new Error(`Failed to set property '${key}'`);
      }
    }
  }
  return destination;
}

function CloneObjectPropertiesOwnKeysNoVerify<T extends object>(destination: T, source: T, depth: number = 0): T {
  if (depth > 0) {
    const depthMinusOne: number = depth - 1;
    const keys: string[] = Object.keys(source);
    let key: string;
    for (let i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      (destination as any)[key] = Clone((source as any)[key], depthMinusOne);
    }
  } else {
    Object.assign(destination, source);
  }
  return destination;
}

function CloneObjectPropertiesAllKeysNoVerify<T extends object>(destination: T, source: T, depth: number = 0): T {
  if (depth > 0) {
    const depthMinusOne: number = depth - 1;
    for (const key in source) {
      (destination as any)[key] = Clone((source as any)[key], depthMinusOne);
    }
  } else {
    for (const key in source) {
      destination[key] = source[key];
    }
  }
  return destination;
}


function CloneObject<T extends object>(input: T, depth: number = 0): T {
  if (input.constructor) {
    if (input.constructor === Object) {
      return CloneObjectPropertiesOwnKeysNoVerify(Object.create(null), input, depth);
    } else if (input.constructor === Array) {
      const depthMinusOne: number = depth - 1;
      return (depth > 0)
        ? (input as any).map((value: any) => Clone(value, depthMinusOne))
        : (input as any).slice();
    } else if (
      (input.constructor === Int8Array)
      || (input.constructor === Uint8Array)
      || (input.constructor === Int16Array)
      || (input.constructor === Uint16Array)
      || (input.constructor === Int32Array)
      || (input.constructor === Uint32Array)
      || (input.constructor === Float32Array)
      || (input.constructor === Float64Array)
      || (input.constructor === ArrayBuffer)
    ) {
      return (input as any).slice();
    } else if (input.constructor === RegExp) {
      return new RegExp((input as any).source, (input as any).flags) as any;
    } else if (
      (input.constructor === Error)
      || (input.constructor === EvalError)
      || (input.constructor === RangeError)
      || (input.constructor === ReferenceError)
      || (input.constructor === SyntaxError)
      || (input.constructor === TypeError)
      || (input.constructor === URIError)
    ) {
      const error: Error = new (input.constructor as any)((input as any).message);
      error.name = (input as any).name;
      error.stack = (input as any).message;
      return error as any;
    } else if (input.constructor === Number) {
      return new Number((input as any).valueOf()) as any;
    } else if (input.constructor === Boolean) {
      return new Boolean((input as any).valueOf()) as any;
    } else if (input.constructor === String) {
      return new String((input as any).valueOf()) as any;
    } else if (input.constructor === Date) {
      return new Date((input as any).getTime()) as any;
    } else if (input.constructor === Map) {
      return new Map(Array.from((input as any).entries())) as any;
    } else if (input.constructor === WeakMap) {
      throw new Error(`Cannot clone a WeakMap`);
    } else if (input.constructor === Set) {
      return new Set(Array.from((input as any).values())) as any;
    } else if (input.constructor === WeakSet) {
      throw new Error(`Cannot clone a WeakSet`);
    } else if (input.constructor === Promise) {
      return Promise.resolve(input) as any;
    } else if (input instanceof Element) {
      return input.cloneNode(true) as any;
    } else {
      try {
        return CloneObjectPropertiesAllKeysVerify(new (input.constructor as any)(), input, depth);
      } catch (e) {
        return CloneObjectPropertiesAllKeysVerify(Object.setPrototypeOf(Object.create(null), input.constructor.prototype), input, depth);
      }
    }
  } else {
    return CloneObjectPropertiesOwnKeysNoVerify(Object.create(null), input, depth);
  }
}

function Clone<T>(input: T, depth: number = 0): T {
  const type: string = typeof input;
  if (input === null) {
    return input;
  } else if (type === 'object') {
    if ('clone' in input) {
      return (input as any).clone();
    } else if (Symbol.for('clone') in input) {
      return (input as any)[Symbol.for('clone')]();
    } else {
      return CloneObject(input as any, depth);
    }
  } else if (type === 'function') {
    return function(...args: any[]) {
      return (input as any).apply(this, args);
    } as any;
  } else if (type === 'bigint') {
    return BigInt(input) as any;
  } else {
    return input;
  }
}


function testClone(): void {
  const a = new Uint8Array(8);
  debugger;
  const b = Clone(a);
  console.log(a, b);
}

/*------------------------------*/


interface ImmutableProxyHandler<T extends object> {
  getPrototypeOf? (source: T, target: T): object | null;
  setPrototypeOf? (source: T, target: T, v: any): boolean;
  isExtensible? (source: T, target: T): boolean;
  preventExtensions? (source: T, target: T): boolean;
  getOwnPropertyDescriptor? (source: T, target: T, p: PropertyKey): PropertyDescriptor | undefined;
  has? (source: T, target: T, p: PropertyKey): boolean;
  get? (source: T, target: T, p: PropertyKey, receiver: any): any;
  set? (source: T, target: T, p: PropertyKey, value: any, receiver: any): boolean;
  deleteProperty? (source: T, target: T, p: PropertyKey): boolean;
  defineProperty? (source: T, target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean;
  enumerate? (source: T, target: T): PropertyKey[];
  ownKeys? (source: T, target: T): PropertyKey[];
  apply? (source: T, target: T, thisArg: any, argArray?: any): any;
  construct? (source: T, target: T, argArray: any, newTarget?: any): object;
}

function ImmutableProxy<T extends object>(source: T, handler: ImmutableProxyHandler<T> = {}): T {

  function wrap<F extends (...args: any[]) => any>(callback: (source: T, ...args: Parameters<F>) => ReturnType<F>): F {
    return function(...args: any): any {
      return callback.call(this, source, ...args);
    } as F;
  }

  const _handler: ProxyHandler<T> = {};

  _handler.getPrototypeOf = (typeof handler.getPrototypeOf === 'function')
    ? wrap(handler.getPrototypeOf)
    : () => Reflect.getPrototypeOf(source);

  _handler.get = (typeof handler.get === 'function')
    ? wrap(handler.get)
    : (target: T, p: PropertyKey, receiver: any) => {
      return Reflect.get(target, p, receiver);
      // return Reflect.has(target, p)
      //   ? Reflect.get(target, p, receiver)
      //   : Reflect.get(source, p, receiver);
    };

  _handler.set = (typeof handler.set === 'function')
    ? wrap(handler.set)
    : (target: T, p: PropertyKey, value: any, receiver: any) => {
      return Reflect.set(target, p, value, receiver);
    };

  _handler.setPrototypeOf = (typeof handler.setPrototypeOf === 'function')
    ? wrap(handler.setPrototypeOf)
    : (target: T, v: any) => {
      throw new Error(`Cannot set`);
    };

  return Object.assign(
    new Proxy(source, _handler),
    // new Proxy(Object.create(null), {
    //   getPrototypeOf(target: T): object | null {
    //     return Reflect.getPrototypeOf(source);
    //   },
    //   setPrototypeOf(target: T, v: any): boolean {
    //
    //   },
    //   isExtensible(target: T): boolean {
    //
    //   },
    //   preventExtensions(target: T): boolean {
    //
    //   },
    //   getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor | undefined {
    //
    //   },
    //   has(target: T, p: PropertyKey): boolean {
    //
    //   },
    //   get(target: T, p: PropertyKey, receiver: any): any {
    //
    //   },
    //   set(target: T, p: PropertyKey, value: any, receiver: any): boolean {
    //
    //   },
    //   deleteProperty(target: T, p: PropertyKey): boolean {
    //
    //   },
    //   defineProperty(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean {
    //
    //   },
    //   enumerate(target: T): PropertyKey[] {
    //
    //   },
    //   ownKeys(target: T): PropertyKey[] {
    //
    //   },
    //   apply(target: T, thisArg: any, argArray?: any): any {
    //
    //   },
    //   construct(target: T, argArray: any, newTarget?: any): object {
    //
    //   },
    // }),
    Object.freeze(source)
  );
}


function testImmutableProxy(): void {
  const data = [0, 1];
  const proxy = ImmutableProxy(data);

  console.warn('test');

  if (!(proxy instanceof Array)) {
    throw new Error(`!(proxy instanceof Array)`);
  }

  if (proxy[0] !== 0) {
    throw new Error(`proxy[0] !== 0`);
  }

  if (proxy[2] !== void 0) {
    throw new Error(`proxy[2] !== void 0`);
  }

  if (proxy.length !== 2) {
    throw new Error(`proxy.length !== 2`);
  }


  proxy[1] = -1;
  if (proxy[1] !== -1) {
    throw new Error(`proxy[1] !== -1`);
  }


  proxy.push(2);
  // @ts-ignore
  if (proxy.length !== 3) {
    throw new Error(`proxy.length !== 3`);
  }

  if (proxy[2] !== 2) {
    throw new Error(`proxy[2] !== 2`);
  }

  console.log(Object.keys(proxy));
  // console.log(proxy);
}




/*------------------------------*/

export interface ISourceProxy {
  data: any;
  readonly template: any;

  getTemplateSource<S extends ISource<any> = ISource<any>>(path: PropertyKey[]): S;
}


export const SOURCE_PROXY_PRIVATE = Symbol('source-proxy-private');

export interface ISourceProxyPrivate {
  sources: IDeepMap<ISource<any>>;
  templateProxy: any;
  dataProxy: any;
  everyKeyAsSource: boolean;
}

export interface ISourceProxyInternal extends ISourceProxy {
  [SOURCE_PROXY_PRIVATE]: ISourceProxyPrivate;
}

export function ConstructSourceProxy(proxy: ISourceProxy, everyKeyAsSource: boolean = true): void {
  ConstructClassWithPrivateMembers(proxy, SOURCE_PROXY_PRIVATE);
  (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].sources = new DeepMap<ISource<any>>();
  (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].templateProxy = SourceProxyCreateTemplateProxy(proxy);
  SourceProxySetData(proxy, Object.create(null));
  (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].everyKeyAsSource = Boolean(everyKeyAsSource);
}





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

function ReflectObjectProperties<T extends object>(destination: object, source: T): T {
  // delete undefined properties of 'source' from 'destination'
  const destinationKeys: string[] = Object.keys(destination);
  for (let i = 0, l = destinationKeys.length; i < l; i++) {
    if (!source.hasOwnProperty(destinationKeys[i])) {
      delete (destination as any)[destinationKeys[i]];
    }
  }

  // assign new properties
  return Object.assign(destination, source);
  // const sourceKeys: string[] = Object.keys(source);
  // for (let i = 0, l = sourceKeys.length; i < l; i++) {
  //   (destination as any)[sourceKeys[i]] = (source as any)[sourceKeys[i]];
  // }
  //
  // return destination as T;
}

function DeleteObjectProperties(obj: object): void {
  const keys: string[] = Object.keys(obj);
  for (let i = 0, l = keys.length; i < l; i++) {
    delete (obj as any)[keys[i]];
  }
}




const objectMethodCache = new WeakMap<any, Map<PropertyKey, any>>();
function CacheObjectMethod<F extends ((...args: any[]) => any)>(target: any, propertyName: PropertyKey, newMethod: F): F {
  let map: Map<PropertyKey, any> | undefined = objectMethodCache.get(target);

  if (map === void 0) {
    map = new Map<PropertyKey, any>();
    objectMethodCache.set(target, map);
  }

  let method: F = map.get(propertyName);
  if (method === void 0) {
    method = newMethod;
    map.set(propertyName, method);
  }

  return method;
}


export function SourceProxyCreateTemplateProxy(proxy: ISourceProxy, path: PropertyKey[] = []): any {
  return new Proxy(Object.create(null), {
    get: (target: any, propertyName: PropertyKey) => {
      return SourceProxyGetTemplateValue(proxy, path, propertyName);
    },
    set: (target: any, propertyName: PropertyKey, value: any) => {
      ObjectPathSet<any>((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy, path.concat(propertyName), value);
      return true;
    },
    deleteProperty: (target: any, propertyName: PropertyKey): boolean => {
      return ObjectPathDelete((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy, path.concat(propertyName));
    },
    ownKeys: () => {
      return Object.keys(ObjectPathGet((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy, path));
    }, // https://stackoverflow.com/questions/40352613/why-does-object-keys-and-object-getownpropertynames-produce-different-output
    getOwnPropertyDescriptor: () => {
      return {
        enumerable: true,
        configurable: true,
      };
    }
  });
}

export function SourceProxyGetTemplateValue(proxy: ISourceProxy, path: PropertyKey[], propertyName: PropertyKey): any {
  const is$$: boolean = SourceProxyIs$$(propertyName);
  const isSourceKey: boolean = SourceProxyIsSourceKey(proxy, propertyName);

  if (is$$ || isSourceKey) {
    let source: ISource<any> | undefined = (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].sources.get(path);
    if (source === void 0) {
      source = new Source<any>();
      try {
        source.emit(ObjectPathGet((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy, path));
      } catch (e) {}
      (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].sources.set(path, source);
    }
    return is$$
      ? source
      : CacheObjectMethod(source, propertyName, (source as any)[propertyName].bind(source));
  } else {
    return SourceProxyCreateTemplateProxy(proxy, path.concat(propertyName));
  }
}



export function SourceProxyEmitValue(proxy: ISourceProxy, path: PropertyKey[], value: any): void {
  const map: Map<any, any> = ((proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].sources as IDeepMapInternal<ISource<any>>)[DEEP_MAP_PRIVATE].map;
  const entry: any = DeepMapGetPartial(map, path);
  if (entry === void 0) {
    // do nothing
  } else if (entry instanceof Map) {
    const iterator: IterableIterator<[any[], ISource<any>]> = DeepMapEntries(entry);
    let result: IteratorResult<[any[], ISource<any>]>;
    while (!(result = iterator.next()).done) {
      result.value[1].emit(
        (result.value[0].length === 0)
          ? value
          : void 0
      );
    }
  } else {
    entry.emit(value);
  }
}

export function SourceProxyIs$$(propertyName: PropertyKey): boolean {
  return (typeof propertyName === 'string') && propertyName.startsWith('$$');
}

export function SourceProxyIsSourceKey(proxy: ISourceProxy, propertyName: PropertyKey): boolean {
  return (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].everyKeyAsSource && (propertyName in Source.prototype);
}


export function SourceProxySetData(proxy: ISourceProxy, source: object): void {
  (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy = SourceProxyCreateDataProxy(proxy, [], source);
}

export function SourceProxyCreateDataProxy<T extends object>(proxy: ISourceProxy, path: PropertyKey[], source: T): T {
  const _proxy: T = new Proxy(source, {
    get: (target: any, propertyName: PropertyKey, receiver: any): any => {
      return SourceProxyGetDataValue(proxy, path, target, propertyName, receiver);
    },
    set: (target: any, propertyName: PropertyKey, value: any, receiver: any) => {
      return SourceProxySetDataValue(proxy, path, target, propertyName, value, receiver);
    },
    deleteProperty: (target: any, propertyName: PropertyKey): boolean => {
      return SourceProxyDeleteDataValue(proxy, path, target, propertyName);
    },
    // has: (target: any, propertyName: PropertyKey): boolean => {
    //   return Reflect.has(target, propertyName);
    // },
    // getPrototypeOf: (): object | null => {
    //   return Reflect.getPrototypeOf(data);
    // }
  });

  for (const key in source) {
    const value: any = Reflect.get(source, key);
    const _value: any = SourceProxyEmitDataValue(proxy, path, key, value);
    if (_value !== value) {
      Reflect.set(source, key, _value);
    }
    // source[key] = SourceProxyEmitDataValue(proxy, path, key, source[key]);
  }

  return _proxy;
}

export function SourceProxyGetDataValue(proxy: ISourceProxy, path: PropertyKey[], target: any, propertyName: PropertyKey, receiver: any): any {
  if (SourceProxyIs$$(propertyName)) {
    throw new Error(`Cannot get a property starting with $$`);
  } else if (SourceProxyIsSourceKey(proxy, propertyName)) {
    throw new Error(`Cannot get the property '${String(propertyName)}' because it is a part of a source`);
  } else {
    return Reflect.get(target, propertyName, receiver);
  }
}

export function SourceProxySetDataValue(proxy: ISourceProxy, path: PropertyKey[], target: any, propertyName: PropertyKey, value: any, receiver: any): boolean {
  return Reflect.set(target, propertyName, SourceProxyEmitDataValue(proxy, path, propertyName, value), receiver);
}

export function SourceProxyEmitDataValue<T>(proxy: ISourceProxy, path: PropertyKey[], propertyName: PropertyKey, value: T): T {
  if (SourceProxyIs$$(propertyName)) {
    throw new Error(`Cannot set a property starting with $$`);
  } else if (SourceProxyIsSourceKey(proxy, propertyName)) {
    throw new Error(`Cannot set the property '${String(propertyName)}' because it is a part of a source`);
  } else {
    const _path: PropertyKey[] = path.concat(propertyName);

    if ((typeof value === 'object') && (value !== null)) { // 'value' is an object
      const source: ISource<any> | undefined = (proxy as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].sources.get(_path);

      if (source === void 0) {
        value = SourceProxyCreateDataProxy(proxy, _path, value as any); // cast 'value' to proxy
      } else if (value !== source.value) {
        value = SourceProxyCreateDataProxy(proxy, _path, value as any); // cast 'value' to proxy
        source.emit(value);
      }
    } else {
      SourceProxyEmitValue(proxy, _path, value);
    }
    return value;
  }
}

export function SourceProxyDeleteDataValue(proxy: ISourceProxy, path: PropertyKey[], target: any, propertyName: PropertyKey): boolean {
  if (SourceProxyIs$$(propertyName)) {
    throw new Error(`Cannot delete a property starting with $$`);
  } else if (SourceProxyIsSourceKey(proxy, propertyName)) {
    throw new Error(`Cannot delete the property '${String(propertyName)}' because it is a part of a source`);
  } else {
    SourceProxyEmitValue(proxy, path.concat(propertyName), void 0);

    return Reflect.deleteProperty(target, propertyName);
  }
}



class SourceProxy implements ISourceProxy {


  constructor(everyKeyAsSource?: boolean) {
    ConstructSourceProxy(this, everyKeyAsSource);
  }

  get data(): any {
    return ((this as unknown) as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].dataProxy;
  }

  set data(value: any) {
    SourceProxySetData(this, value);
  }

  get template(): any {
    return ((this as unknown) as ISourceProxyInternal)[SOURCE_PROXY_PRIVATE].templateProxy;
  }

  getTemplateSource<S extends ISource<any> = ISource<any>>(path: PropertyKey[]): S {
    return SourceProxyGetTemplateValue(this, path, '$$');
  }
}

function testSourceProxy2() {


  interface A {
    a: string;
    b: string[];
    c: {
      a: string;
    };
  }

  const a/*: A*/ = {
    //a: 'a',
    // b: ['b0', 'b1'],
    b: ['b0'],
    // c: {
    //   a: 'c-a',
    // }
  };


  const proxy = new SourceProxy();
  // proxy.template.a.$$.pipe((value: any) => {
  //   console.log('a emit', value);
  // }).activate();

  // proxy.template.b.pipe((value: any) => {
  //   console.log('b emit', value);
  // }).activate();
  // proxy.getTemplateSource(['b', 2]).pipe((value: any) => {
  //   console.log('b emit', value);
  // }).activate();

  // proxy.template.b.$$.pipe((value: any) => {
  //   console.log('b emit', value);
  // }).activate();
  //
  // proxy.template.b[0].pipe((value: any) => {
  //   console.log('b[0] emit', value);
  // }).activate();

  // proxy.data.a = 'a';
  proxy.data = a;
  // debugger;
  // proxy.data.b = 1;
  // delete (proxy.data.b);
  // console.log(proxy.data.b);
  console.log(proxy.data.b instanceof Array);
  console.log(proxy.data.b.length);
  console.log(proxy.data.b.push(5));
  console.log(proxy.data.b.push(6));
  console.log(proxy.data.b[0] = 1);
  console.log(proxy.data.b);

  // console.log(Object.keys(proxy.template));

  (window as any).proxy = proxy;
  // console.log(proxy.data.a);

}



/*------------------------------*/


const objectObservers: WeakMap<object, object> = new WeakMap<object, object>();

function CreateUniqObjectObserver<T extends object>(
  source: T,
  onSet: (path: PropertyKey[], value: any) => void,
  onDelete: (path: PropertyKey[]) => void,
  path: PropertyKey[] = []
): T {
  let proxy: T | undefined = objectObservers.get(source) as (T | undefined);
  if (proxy === void 0) {
    proxy = new Proxy(source, {
      get: (target: any, propertyName: PropertyKey, receiver: any): any => {
        return Reflect.get(target, propertyName, receiver);
      },
      set: (target: any, propertyName: PropertyKey, value: any, receiver: any) => {
        const _path: PropertyKey[] = path.concat(propertyName);

        if ((typeof value === 'object') && (value !== null)) {
          value = CreateUniqObjectObserver(value, onSet, onDelete, _path);
        }

        onSet(_path, value);

        return Reflect.set(target, propertyName, value, receiver);
      },
      deleteProperty: (target: any, propertyName: PropertyKey): boolean => {
        onDelete(path.concat(propertyName));

        return Reflect.deleteProperty(target, propertyName);
      },
    });
    objectObservers.set(source, proxy);

    for (const key in source) {
      Reflect.set(proxy, key, Reflect.get(source, key));
    }
  }

  return proxy;
}


class SourceProxy2<T extends object> {
  private _data: T;
  private _observables: DeepMap<ISource<any>>;

  constructor(source: T = Object.create(null)) {
    this._observables = new DeepMap<ISource<any>>();

    this.data = source;
  }

  get data(): T {
    return this._data;
  }

  set data(value: T) {
    this._data = CreateUniqObjectObserver<T>(value, (path: any[], value: any) => {
      console.warn('set', path, value);
      this._emit(path, value);
    }, (path: any[]) => {
      console.warn('delete', path);
      this._emit(path, void 0);
    });

    this._emit([], this._data);
  }

  observe<V>(path: PropertyKey[]): ISource<V | undefined> {
    path = path.map((key: PropertyKey) => {
      return (typeof key === 'number') ? String(key) : key;
    });
    let source: ISource<V> | undefined = this._observables.get(path) as (ISource<any> | undefined);
    if (source === void 0) {
      source = new Source<V>().emit(this.get(path));
      this._observables.set(path, source);
    }
    return source;
  }

  unobserve(path: PropertyKey[]): boolean {
    return this._observables.delete(path);
  }

  get<V>(path: PropertyKey[]): V {
    return ObjectPathGet(this._data, path);
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
          ((typeof value === 'object') && (value !== null) && ObjectPathExists(value, result.value[0]))
            ? ObjectPathGet(value, result.value[0])
            : ((result.value[0].length === 0) ? value : void 0)
        );
      }
    } else {
      entry.emit(value);
    }
  }
}

function testMagicObject() {
  const a: any = { a: { b: 'b' } };

  const data = CreateUniqObjectObserver<any>(a, (path: any[], value: any) => {
    console.log('set', path, value);
  }, (path: any[]) => {
    console.log('delete', path);
  });

  data.b = 'k';
  // data.a = 'k';
  // delete (data.a);
}

function testSourceProxy3() {
  function test1() {
    const data = new SourceProxy2<any>({
      c: {
        a: 'c-a-1',
      }
    });

    console.log(typeof data.data.c === 'object'); // true
    console.log('c' in data.data); // true
    console.log(Object.keys(data.data)); // ['c']
    console.log('----');


    data.observe(['c'])
      .pipeTo((value: any) => {
        console.log('c', value);
      }).activate();

    data.observe(['c', 'a'])
      .pipeTo((value: any) => {
        console.log('c.a', value);
      }).activate();

    data.data.c.a = 'c-a-2'; // c.a => c-a-2
    data.data.c = { a: 'c-a-3' }; // c.a => c-a-3, c => { a: 'c-a-3' }
    data.data.c = 'c'; // c => c, c.a => void 0
    data.data.c = { a: 'c-a-4' }; // c => { a: 'c-a-4' }, c.a => c-a-4
    delete (data.data.c.a); // c.a => void 0
    data.data.c = { a: 'c-a-5' }; // c => { a: 'c-a-5' }, c.a => c-a-5
    delete (data.data.c); // void 0 => c, c.a => void 0
    data.data.c = { a: 'c-a-6' }; // c => { a: 'c-a-6' }, c.a => c-a-6
    data.data = {}; // void 0 => c, c.a => void 0
  }

  function test2() {
    const data = new SourceProxy2<any>({
      c: ['c0', 'c1', 'c2']
    });

    console.log(typeof data.data.c === 'object'); // true
    console.log('c' in data.data); // true
    console.log(Object.keys(data.data)); // ['c']
    console.log(Array.isArray(data.data.c)); // true
    console.log('slice' in data.data.c); // true
    console.log('----');


    data.observe(['c'])
      .pipeTo((value: any) => {
        console.log('c', value);
      }).activate();

    data.observe(['c', 0])
      .pipeTo((value: any) => {
        console.log('c[0]', value);
      }).activate();

    data.data.c[0] = 'c0-2'; // c[0] => c0-2
    data.data.c = ['c0-3', 'c1-3']; // c[0] => c0-3, c => ['c0-3', 'c1-3']
    data.data.c = 'c'; // c => c, c[0] => void 0
    data.data.c = ['c0-4', 'c1-4']; // c[0] => c0-4, c => ['c0-4', 'c1-4']
    data.data.c.shift(); // c[0] => c1-4
    data.data.c.unshift('c-unshift'); // c[0] => c-unshift
    data.data.c.length = 0; // WARN problem
    data.data.c = []; // c[0] => void 0
    data.data.c.push('c-push'); // c[0] => c-push
    data.data.c = [2, 1]; // c[0] => 2, c => [2, 1]
    data.data.c.sort(); // c[0] => 1
  }

  // test1();
  test2();
}



export function testSourceProxy(): void {
  // testSourceObject();
  // testSourceObject2();
  // testSourceProxy2();
  // testClone();
  // testImmutableProxy();
  // testMagicObject();
  testSourceProxy3();
}
