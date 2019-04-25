import { Observer } from '@lifaon/observables/public';
import { IDynamicProperty, IDynamicPropertyConstructor } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

export const DYNAMIC_PROPERTY_PRIVATE = Symbol('dynamic-property-private');

export interface IDynamicPropertyPrivate<T> {
  node: Node;
  name: string;
}

export interface IDynamicPropertyInternal<T> extends IDynamicProperty<T> {
  [DYNAMIC_PROPERTY_PRIVATE]: IDynamicPropertyPrivate<T>;
}


export function ConstructDynamicProperty<T>(dynamicProperty: IDynamicProperty<T>, node: Node, name: string): void {
  ConstructClassWithPrivateMembers(dynamicProperty, DYNAMIC_PROPERTY_PRIVATE);
  BindObserverWithNodeStateObservable(dynamicProperty, node);
  (dynamicProperty as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].node = node;
  (dynamicProperty as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].name = name;
}


/**
 * Searches and returns a case insensitive property in an object
 * @param name
 * @param object
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


export function DynamicPropertyOnEmit<T>(dynamicProperty: IDynamicProperty<T>, value: T): void {
  const name: string | null = GetCaseInsensitiveProperty(
    (dynamicProperty as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].name,
    (dynamicProperty as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].node,
  );

  if (name !== null) {
    ((dynamicProperty as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].node as any)[name] = value;
  }
}


export const DynamicProperty: IDynamicPropertyConstructor = class DynamicProperty<T> extends Observer<T> implements IDynamicProperty<T> {
  constructor(node: Node, name: string) {
    super((value: T) => {
      DynamicPropertyOnEmit(this, value);
    });
    ConstructDynamicProperty(this, node, name);
  }

  get node(): Node {
    return ((this as unknown) as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].node;
  }

  get name(): string {
    return ((this as unknown) as IDynamicPropertyInternal<T>)[DYNAMIC_PROPERTY_PRIVATE].name;
  }
};
