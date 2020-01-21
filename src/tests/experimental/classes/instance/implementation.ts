import { IInstance } from './interfaces';
import { GetPropertyDescriptor } from '../../../../misc/helpers/object-helpers';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

// <instance, Map<propName, function>
const propertiesFunctionMap: WeakMap<object, Map<PropertyKey, Function>> = new WeakMap<object, Map<string, Function>>();

export function GetOrCreatePropertiesFunctionMap(instance: object): Map<string, Function> {
  if (propertiesFunctionMap.has(instance)) {
    return propertiesFunctionMap.get(instance) as Map<string, Function>;
  } else {
    const map: Map<string, Function> = new Map<string, Function>();
    propertiesFunctionMap.set(instance, map);
    return map;
  }
}

export function GetOrCreateInstanceFunctionProperty<T extends (...args: any[]) => any>(instance: object, propertyKey: PropertyKey, callback: T, functionsMap: Map<PropertyKey, object> = GetOrCreatePropertiesFunctionMap(instance)): T {
  if (functionsMap.has(propertyKey)) {
    return functionsMap.get(propertyKey) as T;
  } else {
    const _callback = callback.bind(instance);
    functionsMap.set(propertyKey, _callback);
    return _callback;
  }
}

/*----------------------------*/

/** PRIVATES **/

export const INSTANCE_PRIVATE = Symbol('instance-private');

export interface IInstancePrivate<TInstance extends object, TPrototype extends object> {
  instance: TInstance;
  proto: TPrototype;
  functionsMap: Map<string, Function>;
}

export interface IInstanceInternal<TInstance extends object, TPrototype extends object> extends IInstance<TInstance, TPrototype> {
  [INSTANCE_PRIVATE]: IInstancePrivate<TInstance, TPrototype>;
}

/** CONSTRUCTOR **/

export function ConstructInstance<TInstance extends object, TPrototype extends object>(
  instance: IInstance<TInstance, TPrototype>,
  _instance: TInstance,
  proto: TPrototype = instance.constructor as TPrototype,
): void {
  ConstructClassWithPrivateMembers(instance, INSTANCE_PRIVATE);
  const privates: IInstancePrivate<TInstance, TPrototype> = (instance as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE];
  privates.instance = _instance;
  privates.proto = proto;
  privates.functionsMap = GetOrCreatePropertiesFunctionMap(privates.instance);
}

/** FUNCTIONS **/

export function InstanceGetPropertyDescriptor<TInstance extends object, TPrototype extends object, T>(instance: IInstance<TInstance, TPrototype>, propertyKey: PropertyKey): PropertyDescriptor | undefined {
  return GetPropertyDescriptor((instance as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE].proto, propertyKey);
}

/** METHODS **/

export function InstanceProp<TInstance extends object, TPrototype extends object, T>(instance: IInstance<TInstance, TPrototype>, propertyKey: PropertyKey): T | undefined {
  const privates: IInstancePrivate<TInstance, TPrototype> = (instance as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE];
  const descriptor: PropertyDescriptor | undefined = InstanceGetPropertyDescriptor(instance, propertyKey);
  if (descriptor === void 0) {
    return void 0;
  } else {
    if (typeof descriptor.get === 'function') {
      return descriptor.get.call(privates.instance);
    } else if (typeof descriptor.set === 'function') {
      throw new Error(`The property ${ String(propertyKey) } is a pure setter (not gettable)`);
    } else if (typeof descriptor.value === 'function') {
      return GetOrCreateInstanceFunctionProperty(privates.instance, propertyKey, descriptor.value, privates.functionsMap) as T;
    } else {
      return descriptor.value;
    }
  }
}

export function InstanceAssign<TInstance extends object, TPrototype extends object>(instance: IInstance<TInstance, TPrototype>, propertyKey: PropertyKey, value: any): void {
  const privates: IInstancePrivate<TInstance, TPrototype> = (instance as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE];
  const descriptor: PropertyDescriptor | undefined = InstanceGetPropertyDescriptor(instance, propertyKey);
  if ((descriptor !== void 0) && (typeof descriptor.set === 'function')) {
    return descriptor.set.call(privates.instance, value);
  } else {
    (privates.instance as any)[propertyKey] = value;
  }
}

export function InstanceGet<TInstance extends object, TPrototype extends object, T>(instance: IInstance<TInstance, TPrototype>, propertyKey: PropertyKey): T {
  const privates: IInstancePrivate<TInstance, TPrototype> = (instance as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE];
  const descriptor: PropertyDescriptor | undefined = InstanceGetPropertyDescriptor(instance, propertyKey);
  if ((descriptor !== void 0) && (typeof descriptor.get === 'function')) {
    return descriptor.get.call(privates.instance);
  } else {
    throw new Error(`The property ${ String(propertyKey) } is not a getter`);
  }
}

export function InstanceSet<TInstance extends object, TPrototype extends object>(instance: IInstance<TInstance, TPrototype>, propertyKey: PropertyKey, value: any): void {
  const privates: IInstancePrivate<TInstance, TPrototype> = (instance as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE];
  const descriptor: PropertyDescriptor | undefined = InstanceGetPropertyDescriptor(instance, propertyKey);
  if ((descriptor !== void 0) && (typeof descriptor.set === 'function')) {
    return descriptor.set.call(privates.instance, value);
  } else {
    throw new Error(`The property ${ String(propertyKey) } is not a setter`);
  }
}


export function InstanceApply<TInstance extends object, TPrototype extends object, T>(instance: IInstance<TInstance, TPrototype>, propertyKey: PropertyKey, args: any[] = []): T {
  const privates: IInstancePrivate<TInstance, TPrototype> = (instance as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE];
  const descriptor: PropertyDescriptor | undefined = InstanceGetPropertyDescriptor(instance, propertyKey);
  if ((descriptor !== void 0) && (typeof descriptor.value === 'function')) {
    return descriptor.value.apply(privates.instance, args);
  } else {
    throw new Error(`The property ${ String(propertyKey) } is not a function`);
  }
}

/** CLASS **/

export class Instance<TInstance extends object, TPrototype extends object> implements IInstance<TInstance, TPrototype> {
  constructor(instance: TInstance, proto?: TPrototype) {
    ConstructInstance<TInstance, TPrototype>(this, instance, proto);
  }

  get instance(): TInstance {
    return ((this as unknown) as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE].instance;
  }

  get proto(): TPrototype {
    return ((this as unknown) as IInstanceInternal<TInstance, TPrototype>)[INSTANCE_PRIVATE].proto;
  }


  prop<T = any>(propertyKey: PropertyKey): T | undefined {
    return InstanceProp<TInstance, TPrototype, T>(this, propertyKey);
  }

  assign(propertyKey: PropertyKey, value: any): void {
    return InstanceAssign<TInstance, TPrototype>(this, propertyKey, value);
  }

  call<T = any>(propertyKey: PropertyKey, ...args: any[]): T {
    return this.apply(propertyKey, args);
  }


  get<T = any>(propertyKey: PropertyKey): T {
    return InstanceGet<TInstance, TPrototype, T>(this, propertyKey);
  }


  set(propertyKey: PropertyKey, value: any): void {
    return InstanceSet<TInstance, TPrototype>(this, propertyKey, value);
  }


  apply<T = any>(propertyKey: PropertyKey, args?: any[]): T {
    return InstanceApply<TInstance, TPrototype, T>(this, propertyKey, args);
  }
}
