import { ISource, NotificationsObservable, Pipe, Source, TBasePipe } from '@lifaon/observables';
import { IsObject } from '../../misc/helpers/is/IsObject';
import { DeepMap, IDeepMap } from '../../classes/DeepMap';
import { KeyValueMapGeneric } from '@lifaon/observables/src/notifications/core/interfaces';


/*---------------------------------------------------------------------------------------------------------------------*/

export type SourceObject<T extends object> = {
  [P in keyof T]: T[P] extends object
    ? ISource<SourceObject<T[P]>>
    : ISource<T[P]>;
};


export function CastObjectToSourceObject<T extends object>(obj: T, sourceObject: SourceObject<T> = {} as SourceObject<T>): SourceObject<T> {
  // https://jsperf.com/hasownproperty-vs-in-vs-undefined/12
  // https://jsperf.com/object-keys-foreach-vs-for-in-v2/2
  const keys: string[] = Object.keys(obj);
  let key: string;
  for (let i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    if ((sourceObject as any)[key] === void 0) {
      (sourceObject as any)[key] = new Source<any>().emit(
        IsObject((obj as any)[key])
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


function debugSourceObject() {
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

/*---------------------------------------------------------------------------------------------------------------------*/

export interface RevocableProxy<TObject extends object> {
  proxy: TObject;
  revoke: () => void;
}

export const TEMPLATE_DATA_PROXY: symbol = Symbol('template-data-proxy');

function CreateTemplateDataProxy<TObject extends object>(
  onObserve: (path: PropertyKey[], childProxy: object) => void,
  path: PropertyKey[] = [],
): RevocableProxy<TObject> {
  const proxies: Map<PropertyKey, RevocableProxy<any>> = new Map<PropertyKey, RevocableProxy<any>>();

  const revoke = () => {
    revocableProxy.revoke();
    const iterator: Iterator<RevocableProxy<any>> = proxies.values();
    let result: IteratorResult<RevocableProxy<any>>;
    while (!(result = iterator.next()).done) {
      result.value.revoke();
    }
    proxies.clear();
  };

  const revocableProxy: RevocableProxy<TObject> = Proxy.revocable<TObject>(Object.create(null), {
    get: (target: any, propertyKey: PropertyKey, receiver: any): any => {
      if (proxies.has(propertyKey)) {
        return (proxies.get(propertyKey) as RevocableProxy<any>).proxy;
      } else {
        const _path: PropertyKey[] = path.concat(propertyKey);
        const revocableProxy: RevocableProxy<object> = CreateTemplateDataProxy(onObserve, _path);
        proxies.set(propertyKey, revocableProxy);
        onObserve(_path, revocableProxy.proxy);
        return revocableProxy.proxy;
      }
    },
    set: (target: any, propertyKey: PropertyKey, value: any, receiver: any) => {
      throw new Error(`Cannot set the property '${ String(propertyKey) }' on a template data proxy`);
    },
    deleteProperty: (target: any, propertyKey: PropertyKey): boolean => {
      throw new Error(`Cannot delete the property '${ String(propertyKey) }' on a template data proxy`);
    },
  });

  return {
    revoke,
    proxy: revocableProxy.proxy,
  };
}

const TEMPLATE_DATA_PROXY_TO_PIPE_MAP = new WeakMap<any, TBasePipe<any, any>>();

function SetTemplateDataProxyPipe(proxy: any, pipe: TBasePipe<any, any>): void {
  TEMPLATE_DATA_PROXY_TO_PIPE_MAP.set(proxy, pipe);
}

// export function GetTemplateDataProxyObservable(proxy: any): void {
//   return
//   return TEMPLATE_DATA_PROXY_TO_PIPE_MAP.get(proxy, pipe);
// }

export class TemplateDataProxy<TObject extends object> {
  private _data: TObject;
  private _templateProxy: RevocableProxy<TObject>;

  private _observedProperties: IDeepMap<PropertyKey[], TBasePipe<any, any>>;

  constructor(source: TObject = Object.create(null)) {
    this._templateProxy = CreateTemplateDataProxy((path: PropertyKey[], proxy: any) => {
      console.log('observing', path);
      const pipe: TBasePipe<any, any> = Pipe.create();
      SetTemplateDataProxyPipe(proxy, pipe);
      this._observedProperties.set(path, pipe);
    });
    this._observedProperties = new DeepMap<PropertyKey[], any>();
    this.data = source;
  }

  get templateProxy(): TObject {
    return this._templateProxy.proxy;
  }

  revoke(): void {
    return this._templateProxy.revoke();
  }

  /*--*/


  get data(): TObject {
    return this._data;
  }

  set data(value: TObject) {
  }
}


function debugTemplateDataProxy() {
  const proxy = new TemplateDataProxy<any>();
  console.log(proxy.templateProxy.arg1.arg2.arg3);

}


/*---------------------------------------------------------------------------------------------------------------------*/

// IDEA

type Primitive =
  | string
  | boolean
  | number
  | bigint
  | symbol
  | null
  | undefined;

type TMutableObjectValue<TObject extends object, TKey extends keyof TObject> =
  TObject[TKey] extends object
    ? MutableObject<TObject[TKey]>
    : TObject[TKey];


type TMutableObjectSetValue<TObject extends object, TKey extends keyof TObject> =
  TObject[TKey] extends object
    ? (MutableObject<TObject[TKey]> | TObject[TKey])
    : TObject[TKey];

type TMutableObjectPropertiesMap<TObject extends object> = Map<TMutableObjectPropertiesMapKeys<TObject>, TMutableObjectPropertiesMapValues<TObject>>;
type TMutableObjectPropertiesMapKeys<TObject extends object> = keyof TObject;
type TMutableObjectPropertiesMapValues<TObject extends object> = TMutableObjectValue<TObject, keyof TObject>;

type TMutableObjectKeyValueMap = KeyValueMapGeneric;

/**
 * LIMITS: doesnt support getters and setters
 */

// kind of map with events
class MutableObject<TObject extends object> extends NotificationsObservable<TMutableObjectKeyValueMap> {

  protected _properties: TMutableObjectPropertiesMap<TObject>;

  constructor(value?: TObject) {
    super();

    this._properties = new Map<TMutableObjectPropertiesMapKeys<TObject>, TMutableObjectPropertiesMapValues<TObject>>();

    if (IsObject(value)) {
      Object.entries(value).forEach(([key, value]: [string, any]) => {
        this.set(key as keyof TObject, value);
      });
    } else if (value !== void 0) {
      throw new TypeError(`Expected object or void as MutableObject's first argument`);
    }
  }


  get<TKey extends keyof TObject>(propertyKey: TKey): TMutableObjectValue<TObject, TKey> {
    return this._properties.get(propertyKey) as unknown as TMutableObjectValue<TObject, TKey>;
  }

  set<TKey extends keyof TObject>(propertyKey: TKey, value: TMutableObjectSetValue<TObject, TKey>): void {
    type TObjectValue = TObject[TKey] extends object ? TObject[TKey] : never;

    // TODO: if this.get(propertyKey) is already a MutableObject, do a diff instead of creating a new one
    const _value: TMutableObjectValue<TObject, TKey> = (
      IsObject(value)
        ? new MutableObject<TObjectValue>(value as TObjectValue)
        : value
    ) as TMutableObjectValue<TObject, TKey>;

    this._properties.set(propertyKey, _value);
  }

  delete<TKey extends keyof TObject>(propertyKey: TKey): void {
    this._properties.delete(propertyKey);
  }

  has<TKey extends keyof TObject>(propertyKey: TKey): boolean {
    return this._properties.has(propertyKey);
  }


  keys(): IterableIterator<TMutableObjectPropertiesMapKeys<TObject>> {
    return this._properties.keys();
  }

  values(): IterableIterator<TMutableObjectPropertiesMapValues<TObject>> {
    return this._properties.values();
  }

  entries(): IterableIterator<[TMutableObjectPropertiesMapKeys<TObject>, TMutableObjectPropertiesMapValues<TObject>]> {
    return this._properties.entries();
  }

  [Symbol.iterator](): IterableIterator<[TMutableObjectPropertiesMapKeys<TObject>, TMutableObjectPropertiesMapValues<TObject>]> {
    return this.entries();
  }

}

function debugMutableObject() {
  const obj = new MutableObject<number[]>();
  obj.set(5, 10);
}

/*---------------------------------------------------------------------------------------------------------------------*/


export async function debugDataProxy2() {
  // await debugSourceObject();
  // await debugTemplateDataProxy();
  await debugMutableObject();
}
