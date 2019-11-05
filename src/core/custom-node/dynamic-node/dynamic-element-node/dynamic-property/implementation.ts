import { Observer } from '@lifaon/observables';
import { IDynamicProperty, IDynamicPropertyConstructor } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';

/** PRIVATES **/

export const DYNAMIC_PROPERTY_PRIVATE = Symbol('dynamic-property-private');

export interface IDynamicPropertyPrivate<T> {
  node: Node;
  name: string;
}

export interface IDynamicPropertyPrivatesInternal<T> extends IObserverPrivatesInternal<T> {
  [DYNAMIC_PROPERTY_PRIVATE]: IDynamicPropertyPrivate<T>;
}

export interface IDynamicPropertyInternal<T> extends IDynamicPropertyPrivatesInternal<T>, IDynamicProperty<T> {
}

/** CONSTRUCTOR **/

export function ConstructDynamicProperty<T>(instance: IDynamicProperty<T>, node: Node, name: string): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_PROPERTY_PRIVATE);
  BindObserverWithNodeStateObservable(instance, node);
  const privates: IDynamicPropertyPrivate<T> = (instance as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE];
  privates.node = node;
  privates.name = name;
}

/** FUNCTIONS **/

/**
 * Searches and returns a case insensitive property in an object
 */
export function GetCaseInsensitiveProperty(name: string, object: any): string | null {
  if (name in object) {
    return name;
  } else {
    const _name: string = name.toLowerCase();
    for (const prop in object) {
      if (prop.toLowerCase() === _name) {
        return prop;
      }
    }
    return null;
  }
}

/** CONSTRUCTOR FUNCTIONS **/

export function DynamicPropertyOnEmit<T>(instance: IDynamicProperty<T>, value: T): void {
  const privates: IDynamicPropertyPrivate<T> = (instance as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE];

  const name: string | null = GetCaseInsensitiveProperty(
    privates.name,
    privates.node,
  );

  if (name !== null) {
    (privates.node as any)[name] = value;
  }
}

/** METHODS **/

/* GETTERS/SETTERS */

export function DynamicPropertyGetNode<T>(instance: IDynamicProperty<T>): Node {
  return (instance as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].node;
}

export function DynamicPropertyGetName<T>(instance: IDynamicProperty<T>): string {
  return (instance as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].name;
}

/** CLASS **/

export const DynamicProperty: IDynamicPropertyConstructor = class DynamicProperty<T> extends Observer<T> implements IDynamicProperty<T> {
  constructor(node: Node, name: string) {
    super((value: T) => {
      DynamicPropertyOnEmit(this, value);
    });
    ConstructDynamicProperty(this, node, name);
  }

  get node(): Node {
    return DynamicPropertyGetNode<T>(this);
  }

  get name(): string {
    return DynamicPropertyGetName<T>(this);
  }
};
