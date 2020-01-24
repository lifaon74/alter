import { HandleError, TErrorStrategy } from './error-strategies';

export function ObjectPathGet<T>(obj: object, path: PropertyKey[]): T {
  for (let i = 0, l = path.length; i < l; i++) {
    obj = (obj as any)[path[i]];
  }
  return obj as any;
}

export function ObjectPathSet<T>(obj: object, path: PropertyKey[], value: T): void {
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

export function ObjectPathExists(obj: object, path: PropertyKey[]): boolean {
  for (let i = 0, l = path.length; i < l; i++) {
    if (path[i] in obj) {
      obj = (obj as any)[path[i]];
    } else {
      return false;
    }
  }
  return true;
}


/**
 * Returns an iterator over the list of prototypes composing target (target included)
 */
export function * GetPrototypeChain(target: object | null): Generator<object, any, undefined> {
  while (target !== null) {
    yield target;
    target = Object.getPrototypeOf(target);
  }
}

/**
 * Return all own properties (enumerable or not)
 */
export function GetOwnProperties(target: object): PropertyKey[] {
  return (Object.getOwnPropertyNames(target) as PropertyKey[])
    .concat(Object.getOwnPropertySymbols(target));
}

/**
 * Returns an iterator over the list of all properties composing target and its prototypes
 */
export function * GetProperties(target: object | null): Generator<PropertyKey, any, undefined> {
  const iterator: Iterator<object> = GetPrototypeChain(target);
  let result: IteratorResult<object>;
  while (!(result = iterator.next()).done) {
    yield * GetOwnProperties(result.value);
  }
}

/**
 * Returns true if 'target' has 'propertyKey' as own key
 */
export function HasOwnProperty(target: object, propertyKey: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(target, propertyKey);
}

export function HasProperty(target: object, propertyKey: PropertyKey): boolean {
  return (propertyKey in target);
}

/**
 * Returns an iterator over the list of all own descriptors composing target
 */
export function GetOwnPropertyDescriptors(target: object): IterableIterator<[PropertyKey, PropertyDescriptor]> {
  return Object.entries(Object.getOwnPropertyDescriptors(target))[Symbol.iterator]();
}

/**
 * Returns an iterator over the list of all descriptors composing target and its prototypes
 */
export function * GetPropertyDescriptors(target: object | null): Generator<[PropertyKey, PropertyDescriptor], any, undefined> {
  const excludes = new Set<PropertyKey>([
    'constructor',
    '__proto__',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
  ]);
  const properties: Set<PropertyKey> = new Set<PropertyKey>();
  const iterator: Iterator<object> = GetPrototypeChain(target);
  let result: IteratorResult<object>;
  while (!(result = iterator.next()).done) {
    yield * GetOwnProperties(result.value)
      .filter((propertyKey: PropertyKey) => {
        if (excludes.has(propertyKey) || properties.has(propertyKey)) {
          return false;
        } else {
          properties.add(propertyKey);
          return true;
        }
      })
      .map((propertyKey: PropertyKey) => {
        return [propertyKey, Object.getOwnPropertyDescriptor(result.value, propertyKey)] as [PropertyKey, PropertyDescriptor];
      });
  }
}


/**
 * Returns true if 'target' implements deeply source's methods
 */
export function Implements(target: object | null, source: object | null, level: 'exists' | 'type' | 'strict' = 'exists'): boolean {
  if (target === null) {
    return false;
  } else if (source === null) {
    return true;
  } else {
    let targetProperties: Set<PropertyKey> | undefined = (level === 'exists')
      ? new Set<PropertyKey>(GetProperties(target))
      : void 0;

    const iterator: Iterator<PropertyKey> = GetProperties(source);
    let result: IteratorResult<PropertyKey>;
    while (!(result = iterator.next()).done) {
      switch (level) {
        case 'exists':
          if (!(targetProperties as Set<PropertyKey>).has(result.value)) {
            return false;
          }
          break;
        case 'type':
          if (typeof target[result.value] !== typeof source[result.value]) {
            return false;
          }
          break;
        case 'strict':
          if (target[result.value] !== source[result.value]) {
            return false;
          }
          break;
        default:
          throw new TypeError(`Expected 'type' or 'strict' as level`);
      }

    }
    return true;
  }
}

export function MustImplement(target: object, source: object, level: 'exists' | 'type' | 'strict' = 'exists'): asserts target is typeof source {
  let targetProperties: Set<PropertyKey> | undefined = (level === 'exists')
    ? new Set<PropertyKey>(GetProperties(target))
    : void 0;

  const iterator: Iterator<PropertyKey> = GetProperties(source);
  let result: IteratorResult<PropertyKey>;
  while (!(result = iterator.next()).done) {
    switch (level) {
      case 'exists':
        if (!(targetProperties as Set<PropertyKey>).has(result.value)) {
          throw new Error(`The source property '${ result.value }' is missing in target`);
        }
        break;
      case 'type':
        if (typeof target[result.value] !== typeof source[result.value]) {
          throw new Error(`The source property '${ result.value }' has a different type in target`);
        }
        break;
      case 'strict':
        if (target[result.value] !== source[result.value]) {
          throw new Error(`The source property '${ result.value }' is not the same as in target`);
        }
        break;
      default:
        throw new TypeError(`Expected 'type' or 'strict' as level`);
    }

  }
}

/**
 * Returns the PropertyDescriptor of an object searching deeply into its prototype chain
 */
export function GetPropertyDescriptor<T>(target: object | null, propertyKey: PropertyKey): TypedPropertyDescriptor<T> | undefined {
  let descriptor: PropertyDescriptor | undefined;
  const iterator: Iterator<object> = GetPrototypeChain(target);
  let result: IteratorResult<object>;
  while (
    !(result = iterator.next()).done
    && ((descriptor = Object.getOwnPropertyDescriptor(result.value, propertyKey)) === void 0)
  ) {}
  return descriptor;
}


export function CopyOwnDescriptors<TDestination extends object>(source: object, destination: TDestination, conflictStrategy?: TErrorStrategy): TDestination {
  Object.entries(Object.getOwnPropertyDescriptors(source)).forEach(([key, descriptor]) => {
    if (!HasOwnProperty(destination, key) || HandleError(() => new Error(`Property '${ key }' already exists`), conflictStrategy)) {
      Object.defineProperty(destination, key, descriptor);
    }
  });
  return destination;
}

export function CopyDescriptors<TDestination extends object>(source: object, destination: TDestination, conflictStrategy?: TErrorStrategy): TDestination {
  const iterator: Iterator<[PropertyKey, PropertyDescriptor]> = GetPropertyDescriptors(source);
  let result: IteratorResult<[PropertyKey, PropertyDescriptor]>;
  while (!(result = iterator.next()).done) {
    const [key, descriptor] = result.value;
    if (!HasProperty(destination, key) || HandleError(() => new Error(`Property '${ key }' already exists`), conflictStrategy)) {
      Object.defineProperty(destination, key, descriptor);
    }
  }
  return destination;
}

export function SetConstructor<TTarget extends object>(target: TTarget, _constructor: Function): TTarget {
  Object.defineProperty(target, 'constructor', {
    value: _constructor,
    writable: true,
    configurable: true,
    enumerable: false,
  });
  return target;
}

export function SetFunctionName<TTarget extends Function>(target: TTarget, name: string): TTarget {
  Object.defineProperty(target, 'name', Object.assign(Object.getOwnPropertyDescriptor(target, 'name'), { value: name }));
  return target;
}

