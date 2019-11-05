import { Observer } from '@lifaon/observables';
import { IDynamicClass, IDynamicClassConstructor } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';


/** PRIVATES **/

export const DYNAMIC_CLASS_PRIVATE = Symbol('dynamic-class-private');

export interface IDynamicClassPrivate {
  element: Element;
  name: string;
}

export interface IDynamicClassPrivatesInternal extends IObserverPrivatesInternal<boolean> {
  [DYNAMIC_CLASS_PRIVATE]: IDynamicClassPrivate;
}

export interface IDynamicClassInternal extends IDynamicClassPrivatesInternal, IDynamicClass {
}


/** CONSTRUCTOR **/

export function ConstructDynamicClass(instance: IDynamicClass, element: Element, name: string): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_CLASS_PRIVATE);
  BindObserverWithNodeStateObservable(instance, element);
  const privates: IDynamicClassPrivate = (instance as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE];
  privates.element = element;
  privates.name = name;
}

/** FUNCTIONS **/

export function DynamicClassOnEmit(instance: IDynamicClass, value: boolean): void {
  const privates: IDynamicClassPrivate = (instance as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE];
  privates.element.classList.toggle(privates.name, value);
}

/** METHODS **/

/* GETTERS/SETTERS */

export function DynamicClassGetElement(instance: IDynamicClass): Element {
  return (instance as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].element;
}

export function DynamicClassGetName(instance: IDynamicClass): string {
  return (instance as IDynamicClassInternal)[DYNAMIC_CLASS_PRIVATE].name;
}

/** CLASS **/

export const DynamicClass: IDynamicClassConstructor = class DynamicClass extends Observer<boolean> implements IDynamicClass {
  constructor(element: Element, name: string) {
    super((value: boolean) => {
      DynamicClassOnEmit(this, value);
    });
    ConstructDynamicClass(this, element, name);
  }

  get element(): Element {
    return DynamicClassGetElement(this);
  }

  get name(): string {
    return DynamicClassGetName(this);
  }
};
