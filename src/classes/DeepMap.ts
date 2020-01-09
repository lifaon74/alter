/** INTERFACES **/

export interface IDeepMap<TKeys extends any[], TValue> {
  readonly size: number;
  readonly empty: boolean;

  set(keys: TKeys, value: TValue): this;
  get(keys: TKeys): TValue | undefined;
  has(keys: TKeys): boolean;
  delete(keys: TKeys): boolean;
  clear(keys?: any[]): boolean;

  entries(): Generator<[TKeys, TValue]>;
  keys(): Generator<TKeys>;
  values(): Generator<TValue>;
  [Symbol.iterator](): Generator<[TKeys, TValue]>;
  forEach(callback: (entry: TValue, key: TKeys, map: this) => void): void;
}


/** PRIVATES **/

export const DEEP_MAP_PRIVATE = Symbol('deep-map-private');

export interface IDeepMapPrivate<TKeys extends any[], TValue> {
  map: Map<any, any>;
}

export interface IDeepMapPrivatesInternal<TKeys extends any[], TValue> {
  [DEEP_MAP_PRIVATE]: IDeepMapPrivate<TKeys, TValue>;
}

export interface IDeepMapInternal<TKeys extends any[], TValue> extends IDeepMapPrivatesInternal<TKeys, TValue>, IDeepMap<TKeys, TValue> {
}

/** CONSTRUCTOR **/

export function ConstructDeepMap<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>): void {
  Object.defineProperty(instance, DEEP_MAP_PRIVATE, {
    value: {},
    configurable: false,
    writable: false,
    enumerable: false,
  });

  (instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map = new Map<any, any>();
}

/** METHODS **/

export function DeepMapSize<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>): number {
  return DeepMapInternalSize((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map);
}

function DeepMapInternalSize(map: Map<any, any>): number {
  const iterator: IterableIterator<any> = map.values();
  let entry: IteratorResult<any>;
  let size: number = 0;

  while (!(entry = iterator.next()).done) {
    if (entry.value instanceof Map) {
      size += DeepMapInternalSize(entry.value);
    } else {
      size++;
    }
  }

  return size;
}


export function DeepMapInternalEmpty<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>): boolean {
  return DeepMapInternalIsEmpty((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map);
}

export function DeepMapInternalIsEmpty(map: Map<any, any>): boolean {
  const iterator: IterableIterator<any> = map.values();
  let entry: IteratorResult<any>;

  while (!(entry = iterator.next()).done) {
    if (entry.value instanceof Map) {
      if (!DeepMapInternalIsEmpty(entry.value)) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}


export function DeepMapSet<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>, keys: TKeys, value: TValue): void {
  return DeepMapInternalSet<TKeys, TValue>((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map, keys, value);
}

export function DeepMapInternalSet<TKeys extends any[], TValue>(map: Map<any, any>, keys: TKeys, value: TValue): void {
  let entry: any, _entry: any;
  let i: number = 0;
  let key: any;
  const length: number = keys.length;
  const lengthMinusOne: number = length - 1;

  while (true) {
    key = (i < length) ? keys[i] : void 0;
    if (map.has(key)) {
      entry = map.get(key);
      if (entry instanceof Map) {
        map = entry;
      } else {
        if (i < lengthMinusOne) {
          _entry = new Map();
          _entry.set(void 0, entry);
          map.set(key, _entry);
          map = _entry;
        } else {
          map.set(key, value);
          break;
        }
      }
    } else {
      if (i < lengthMinusOne) {
        _entry = new Map();
        map.set(key, _entry);
        map = _entry;
      } else {
        map.set(key, value);
        break;
      }
    }
    i++;
  }
}


export function DeepMapGet<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>, keys: TKeys): TValue | undefined {
  return DeepMapInternalGet<TKeys, TValue>((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map, keys);
}

export function DeepMapInternalGet<TKeys extends any[], TValue>(map: Map<any, any>, keys: TKeys): TValue | undefined {
  let entry: any;
  let i: number = 0;
  let arg: any;
  const length: number = keys.length;

  while (true) {
    arg = (i < length) ? keys[i] : void 0;
    if (map.has(arg)) {
      entry = map.get(arg);
      if (entry instanceof Map) {
        map = entry;
        i++;
      } else {
        return (i < (length - 1))
          ? void 0
          : entry;
      }
    } else {
      return void 0;
    }
  }
}


export function DeepMapHas<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>, keys: TKeys): boolean {
  return DeepMapInternalHas<TKeys>((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map, keys);
}

export function DeepMapInternalHas<TKeys extends any[]>(map: Map<any, any>, keys: TKeys): boolean {
  let entry: any;
  let i: number = 0;
  let arg: any;
  const length: number = keys.length;

  while (true) {
    arg = (i < length) ? keys[i] : void 0;
    if (map.has(arg)) {
      entry = map.get(arg);
      if (entry instanceof Map) {
        map = entry;
        i++;
      } else {
        return (i >= (length - 1));
      }
    } else {
      return false;
    }
  }
}


export function DeepMapDelete<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>, keys: TKeys): boolean {
  return DeepMapInternalDelete<TKeys>((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map, keys);
}

export function DeepMapInternalDelete<TKeys extends any[]>(map: Map<any, any>, keys: TKeys): boolean {
  let entry: any;
  let i: number = 0;
  let arg: any;
  const length: number = keys.length;

  while (true) {
    arg = (i < length) ? keys[i] : void 0;
    if (map.has(arg)) {
      entry = map.get(arg);
      if (entry instanceof Map) {
        map = entry;
        i++;
      } else {
        map.delete(arg);
        return true;
      }
    } else {
      return false;
    }
  }
}


export function DeepMapClear<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>, keys?: any[]): boolean {
  return DeepMapInternalClear((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map, keys);
}

export function DeepMapInternalClear(map: Map<any, any>, keys: any[] = []): boolean {
  if (keys.length === 0) {
    map.clear();
    return true;
  } else {
    let entry: any;
    let i: number = 0;
    let arg: any;
    const length: number = keys.length;
    const lengthMinusOne: number = length - 1;

    while (true) {
      arg = (i < length) ? keys[i] : void 0;
      if (map.has(arg)) {
        entry = map.get(arg);
        if (entry instanceof Map) {
          if (i < lengthMinusOne) {
            map = entry;
            i++;
          } else {
            map.set(arg, entry.get(void 0));
            entry.clear();
            return true;
          }
        } else {
          map.delete(arg);
          return true;
        }
      } else {
        return false;
      }
    }
  }
}


// export function DeepMapGetPartialOld(map: Map<any, any>, keys: TKeys): Map<any, any> | any | undefined {
//   if (keys.length === 0) {
//     return map;
//   } else {
//     let entry: any;
//     let i: number = 0;
//     let arg: any;
//     const length: number = keys.length;
//     const lengthMinusOne: number = length - 1;
//
//     while (true) {
//       arg = (i < length) ? keys[i] : void 0;
//       if (map.has(arg)) {
//         entry = map.get(arg);
//         if (entry instanceof Map) {
//           if (i < lengthMinusOne) {
//             map = entry;
//             i++;
//           } else {
//             return entry;
//           }
//         } else {
//           return (i < length)
//             ? entry
//             : void 0;
//         }
//       } else {
//         return void 0;
//       }
//     }
//   }
// }

export function DeepMapGetPartial<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>, keys: any[]): Map<any, any> | any | undefined {
  return DeepMapInternalGetPartial((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map, keys);
}

export function DeepMapInternalGetPartial(map: Map<any, any>, keys: any[]): Map<any, any> | any | undefined {
  let key: any;
  for (let i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    if ((map instanceof Map) && map.has(key)) {
      map = map.get(key);
    } else {
      return void 0;
    }
  }

  return map;
}


export function DeepMapEntries<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>): Generator<[TKeys, TValue]> {
  return DeepMapInternalEntries<TKeys, TValue>((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map);
}

export function * DeepMapInternalEntries<TKeys extends any[], TValue>(map: Map<any, any>, keys: any[] = []): Generator<[TKeys, TValue]> {
  const iterator: IterableIterator<[any, any]> = map.entries();
  let entry: IteratorResult<[any, any]>;
  let value: any;

  while (!(entry = iterator.next()).done) {
    value = entry.value[1];
    const _keys: any[] = keys.concat([entry.value[0]]);
    if (value instanceof Map) {
      yield * DeepMapInternalEntries(value, _keys) as any;
    } else {
      while ((_keys.length > 0) && (_keys[_keys.length - 1] === void 0)) {
        _keys.pop();
      }
      yield [_keys as TKeys, value];
    }
  }
}


export function DeepMapKeys<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>): Generator<TKeys> {
  return DeepMapInternalKeys<TKeys>((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map);
}

export function * DeepMapInternalKeys<TKeys extends any[]>(map: Map<any, any>, keys: any[] = []): Generator<TKeys> {
  const iterator: IterableIterator<[any, any]> = map.entries();
  let entry: IteratorResult<[any, any]>;
  let value: any;

  while (!(entry = iterator.next()).done) {
    value = entry.value[1];
    const _keys: any[] = keys.concat([entry.value[0]]);
    if (value instanceof Map) {
      yield * DeepMapInternalKeys(value, _keys) as any;
    } else {
      while ((_keys.length > 0) && (_keys[_keys.length - 1] === void 0)) {
        _keys.pop();
      }
      yield _keys as TKeys;
    }
  }
}


export function DeepMapValues<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>): Generator<TValue> {
  return DeepMapInternalValues<TValue>((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map);
}

export function * DeepMapInternalValues<TValue>(map: Map<any, any>): Generator<TValue> {
  const iterator: IterableIterator<any> = map.values();
  let entry: IteratorResult<any>;

  while (!(entry = iterator.next()).done) {
    if (entry.value instanceof Map) {
      yield * DeepMapInternalValues(entry.value) as any;
    } else {
      yield entry.value;
    }
  }
}


export function DeepMapForEach<TKeys extends any[], TValue>(
  instance: IDeepMap<TKeys, TValue>,
  callback: (entry: TValue, key: TKeys, map: any) => void,
  thisArg: any = instance
): void {
  return DeepMapInternalForEach<TKeys, TValue>(
    (instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map,
    callback,
    thisArg,
  );
}

export function DeepMapInternalForEach<TKeys extends any[], TValue>(
  map: Map<any, any>,
  callback: (entry: TValue, key: TKeys, map: any) => void,
  thisArg: any
): void {
  const iterator: Generator<[any, any]> = DeepMapInternalEntries<TKeys, TValue>(map);
  let entry: IteratorResult<[any, any]>;
  while (!(entry = iterator.next()).done) {
    callback.call(thisArg, entry.value[1], entry.value[0], thisArg);
  }
}


export function DeepMapCompact<TKeys extends any[], TValue>(instance: IDeepMap<TKeys, TValue>): void {
  return DeepMapInternalCompact((instance as IDeepMapInternal<TKeys, TValue>)[DEEP_MAP_PRIVATE].map);
}

export function DeepMapInternalCompact(map: Map<any, any>): void {
  map.forEach((entry: any, key: any) => {
    if (entry instanceof Map) {
      DeepMapInternalCompact(entry);
      if (entry.size === 0) {
        map.delete(key);
      }
    }
  });
}


/** CLASS **/

/**
 * DeepMap is a Map which accept many keys as key
 */
export class DeepMap<TKeys extends any[], TValue> implements IDeepMap<TKeys, TValue> {

  constructor() {
    ConstructDeepMap<TKeys, TValue>(this);
  }

  /**
   * Returns the number of entries in this map.
   */
  get size(): number {
    return DeepMapSize<TKeys, TValue>(this);
  }

  /**
   * Returns false if this map contains some entries.
   */
  get empty(): boolean {
    return DeepMapInternalEmpty<TKeys, TValue>(this);
  }

  /**
   * Sets a value, from a key composed of the 'keys' elements, into this map.
   * @param keys
   * @param value
   */
  set(keys: TKeys, value: TValue): this {
    DeepMapSet<TKeys, TValue>(this, keys, value);
    return this;
  }

  /**
   * Gets the value associated with a key composed of the 'keys' elements.
   * @param keys
   */
  get(keys: TKeys): TValue | undefined {
    return DeepMapGet<TKeys, TValue>(this, keys);
  }

  /**
   * Returns true if a values has been set with this key.
   * @param keys
   */
  has(keys: TKeys): boolean {
    return DeepMapHas<TKeys, TValue>(this, keys);
  }

  /**
   * Removes any value associated with this key.
   * @param keys
   */
  delete(keys: TKeys): boolean {
    return DeepMapDelete<TKeys, TValue>(this, keys);
  }

  /**
   * Removes all entries.
   */
  clear(keys?: any[]): boolean {
    return DeepMapClear<TKeys, TValue>(this, keys);
  }

  /**
   * Returns a iterable over the list of entries [key, value]
   */
  entries(): Generator<[TKeys, TValue]> {
    return DeepMapEntries<TKeys, TValue>(this);
  }

  keys(): Generator<TKeys> {
    return DeepMapKeys<TKeys, TValue>(this);
  }

  values(): Generator<TValue> {
    return DeepMapValues<TKeys, TValue>(this);
  }

  [Symbol.iterator](): Generator<[TKeys, TValue]> {
    return DeepMapEntries<TKeys, TValue>(this);
  }

  forEach(callback: (entry: TValue, key: TKeys, map: this) => void): void {
    return DeepMapForEach<TKeys, TValue>(this, callback, this);
  }

  /**
   * Removes unnecessary used space in this map.
   */
  compact(): void {
    return DeepMapCompact<TKeys, TValue>(this);
  }

}
