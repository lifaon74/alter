import { ISource, Source } from '@lifaon/observables/public';
import { DeepMap, IDeepMap } from '../classes/DeepMap';
import { ConstructClassWithPrivateMembers } from '../misc/helpers/ClassWithPrivateMembers';

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

  proxy.templateProxy.a.$$.pipeTo((value: any) => {
    if (value) {
      console.log('a emit', value.b);
    }
  }).activate();

  proxy.templateProxy.a.b.$$.pipeTo((value: any) => {
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

export interface ISourceProxy {

}


export const DEEP_MAP_PRIVATE = Symbol('source-proxy-private');

export interface ISourceProxyPrivate {
  sources: IDeepMap<ISource<any>>;
  templateProxy: any;
  dataProxy: any;
}

export interface ISourceProxyInternal extends ISourceProxy {
  [DEEP_MAP_PRIVATE]: ISourceProxyPrivate;
}

export function ConstructSourceProxy(proxy: ISourceProxy): void {
  ConstructClassWithPrivateMembers(proxy, DEEP_MAP_PRIVATE);
  (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources = new DeepMap<ISource<any>>();
  (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].templateProxy = CreateSourceProxyTemplateProxy(proxy);
  (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].dataProxy = CreateSourceProxyDataProxy(proxy);
}

export function CreateSourceProxyTemplateProxy(proxy: ISourceProxy, path: string[] = []): any {
  return new Proxy(Object.create(null), {
    get: (target: any, propertyName: string) => {
      return SourceProxyGetTemplateValue(proxy, path, propertyName);
    },
    // set: (target: any, propertyName: string, value: any) => {
    //   return SourceProxySetValue(proxy, path, propertyName, value);
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

export function CreateSourceProxyDataProxy(proxy: ISourceProxy, path: string[] = []): any {
  return new Proxy({}, {
    get: (target: any, propertyName: string): any => {
      return SourceProxyGetDataValue(proxy, path, target, propertyName);
    },
    set: (target: any, propertyName: string, value: any) => {
      return SourceProxySetValue(proxy, path, target, propertyName, value);
    },
    deleteProperty: (target: any, propertyName: string): boolean => {
      return SourceProxyDeleteValue(proxy, path, target, propertyName);
    },
  });
}

function ReadObjectPath<T>(obj: object, path: string[]): T {
  for (let i = 0, l = path.length; i < l; i++) {
    obj = (obj as any)[path[i]];
  }
  return obj as any;
}

export function SourceProxyGetTemplateValue(proxy: ISourceProxy, path: string[], propertyName: string): any {
  const _path: string[] = path.concat(propertyName);
  if (propertyName.startsWith('$$')) {
    let source: ISource<any> | undefined = (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.get(_path);
    if (source === void 0) {
      source = new Source<any>();
      (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.set(_path, source);
      source.emit((proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].dataProxy);
    }
    return source;
  } else {
    return CreateSourceProxyTemplateProxy(proxy, _path);
  }
}

export function SourceProxyGetDataValue(proxy: ISourceProxy, path: string[], target: any, propertyName: string): any {
  if (propertyName.startsWith('$$')) {
    throw new Error(`Cannot get a property starting with $$`);
  } else {
    return Reflect.get(target, propertyName);
    // const source: ISource<any> | unknown = privates.sources.get(path.concat(propertyName));
    // return (source === void 0)
    //   ? void 0
    //   : source;
  }
}

export function SourceProxySetValue(proxy: ISourceProxy, path: string[], target: any, propertyName: string, value: any): boolean {
  if (propertyName.startsWith('$$')) {
    throw new Error(`Cannot set a property starting with $$`);
  } else {
    const _path: string[] = path.concat(propertyName);
    let source: ISource<any> | undefined = (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.get(_path);

    if (source === void 0) {
      source = new Source<any>();
      (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.set(_path, source);
      if ((typeof value === 'object') && (value !== null)) {
        value = Object.assign(CreateSourceProxyDataProxy(proxy, _path), Object.freeze(value));
      }
      source.emit(value);
    } else {
      const sourceValue = source.value;
      if ((typeof sourceValue === 'object') && (sourceValue !== null)) { // source was an object
        const keys: string[] = Object.keys(sourceValue);
        if ((typeof value === 'object') && (value !== null)) {
          for (let i = 0, l = keys.length; i < l; i++) {
            if (!value.hasOwnProperty(keys[i])) {
              delete sourceValue[keys[i]];
            }
          }
          Object.assign(sourceValue, Object.freeze(value));
        } else {
          for (let i = 0, l = keys.length; i < l; i++) {
            delete sourceValue[keys[i]];
          }
          source.emit(value);
        }
      }
    }


    // if ((proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.has(_path)) {
    //   // TODO
    //   // const sourceValue = (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.get(_path).value;
    //   // if ((typeof sourceValue === 'object') && (sourceValue !== null)) {
    //   //   for (const prop of Object.keys(sourceValue)) {
    //   //     sourceValue[prop] = void 0;
    //   //   }
    //   // }
    // } else {
    //   const source: ISource<any> = new Source();
    //   (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.set(_path, source);
    // }
    //
    // if ((typeof value === 'object') && (value !== null)) {
    //   Object.freeze(value);
    //   const proxyObject = this._createDataProxy(_path);
    //   for (const prop of Object.keys(value)) {
    //     proxyObject[prop] = value[prop];
    //   }
    //   value = proxyObject;
    // }
    // (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.get(_path).emit(value);
    return true;
  }
}

export function SourceProxyDeleteValue(proxy: ISourceProxy, path: string[], target: any, propertyName: string): boolean {
  if (propertyName.startsWith('$$')) {
    throw new Error(`Cannot delete a property starting with $$`);
  } else {
    const _path: string[] = path.concat(propertyName);
    let source: ISource<any> | undefined = (proxy as ISourceProxyInternal)[DEEP_MAP_PRIVATE].sources.get(_path);

    if (source !== void 0) {
      const sourceValue = source.value;
      if ((typeof sourceValue === 'object') && (sourceValue !== null)) { // source was an object
        const keys: string[] = Object.keys(sourceValue);
        for (let i = 0, l = keys.length; i < l; i++) {
          delete sourceValue[keys[i]];
        }
        source.emit(void 0);
      }
    }

    return true;
  }
}


class SourceProxy implements ISourceProxy {


  constructor() {
    ConstructSourceProxy(this);
  }

  get data(): any {
    return ((this as unknown) as ISourceProxyInternal)[DEEP_MAP_PRIVATE].dataProxy;
  }

  get template(): any {
    return ((this as unknown) as ISourceProxyInternal)[DEEP_MAP_PRIVATE].templateProxy;
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

  const a: A = {
    a: 'a',
    b: ['b0', 'b1'],
    c: {
      a: 'c-a',
    }
  };


  const proxy = new SourceProxy();
  console.log(proxy.template.a);
  // console.log(proxy.data.a);

}

export function testSourceProxy(): void {
  // testSourceObject();
  // testSourceObject2();
  testSourceProxy2();
}
