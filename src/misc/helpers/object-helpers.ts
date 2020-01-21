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
export function * GetPrototypeChain(target: object | null): Generator<object> {
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
export function * GetProperties(target: object | null): Generator<PropertyKey> {
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



/**
 * Returns an iterator over the list of all descriptors composing target and its prototypes
 */
export function * GetPropertyDescriptors(target: object | null): Generator<PropertyDescriptor> {
  const iterator: Iterator<object> = GetPrototypeChain(target);
  let result: IteratorResult<object>;
  while (!(result = iterator.next()).done) {
    yield * GetOwnProperties(result.value).map((propertyKey: PropertyKey) => {
      return Object.getOwnPropertyDescriptor(result.value, propertyKey) as PropertyDescriptor;
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

