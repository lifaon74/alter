
import { Observer } from '@lifaon/observables';
import { IDynamicClass, IDynamicClassConstructor } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

export const DYNAMIC_CLASS_PRIVATE = Symbol('dynamic-class-private');

export interface IDynamicClassPrivate {
  element: Element;
  name: string;
}

export interface IDynamicClassInternal extends IDynamicClass {
  [DYNAMIC_CLASS_PRIVATE]: IDynamicClassPrivate;
}


export function ConstructDynamicClass(dynamicClass: IDynamicClass, element: Element, name: string): void {
  ConstructClassWithPrivateMembers(dynamicClass, DYNAMIC_CLASS_PRIVATE);
  BindObserverWithNodeStateObservable(dynamicClass, element);
  (dynamicClass as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].element = element;
  (dynamicClass as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].name = name;
}

export function DynamicClassOnEmit(dynamicClass: IDynamicClass, value: boolean): void {
  (dynamicClass as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].element.classList.toggle((dynamicClass as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].name, value);
}

export const DynamicClass: IDynamicClassConstructor = class DynamicClass extends Observer<boolean> implements IDynamicClass {
  constructor(element: Element, name: string) {
    super((value: boolean) => {
      DynamicClassOnEmit(this, value);
    });
    ConstructDynamicClass(this, element, name);
  }

  get element(): Element {
    return ((this as unknown) as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].element;
  }

  get name(): string {
    return ((this as unknown) as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].name;
  }
};
