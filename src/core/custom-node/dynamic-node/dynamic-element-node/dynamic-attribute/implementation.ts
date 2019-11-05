import { IDynamicAttribute, IDynamicAttributeConstructor } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { Observer } from '@lifaon/observables';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';

/** PRIVATES **/

export const DYNAMIC_ATTRIBUTE_PRIVATE = Symbol('dynamic-attribute-private');

export interface IDynamicAttributePrivate {
  element: Element;
  name: string;
}

export interface IDynamicAttributePrivatesInternal extends IObserverPrivatesInternal<string> {
  [DYNAMIC_ATTRIBUTE_PRIVATE]: IDynamicAttributePrivate;
}

export interface IDynamicAttributeInternal extends IDynamicAttributePrivatesInternal, IDynamicAttribute {
}

/** CONSTRUCTOR **/

export function ConstructDynamicAttribute(
  instance: IDynamicAttribute,
  element: Element,
  name: string
): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_ATTRIBUTE_PRIVATE);
  BindObserverWithNodeStateObservable(instance, element);
  const privates: IDynamicAttributePrivate = (instance as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE];
  privates.element = element;
  privates.name = name;
}

/** CONSTRUCTOR FUNCTIONS **/

export function DynamicAttributeOnEmit(instance: IDynamicAttribute, value: string): void {
  const privates: IDynamicAttributePrivate = (instance as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE];
  if ((value === null) || (value === void 0)) {
    privates.element.removeAttribute(privates.name);
  } else {
    privates.element.setAttribute(privates.name, value);
  }
}

/** METHODS **/

/* GETTERS/SETTERS */

export function DynamicAttributeGetElement(instance: IDynamicAttribute): Element {
  return (instance as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].element;
}

export function DynamicAttributeGetName(instance: IDynamicAttribute): string {
  return (instance as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].name;
}

/** CLASS **/

export const DynamicAttribute: IDynamicAttributeConstructor = class DynamicAttribute extends Observer<string> implements IDynamicAttribute {
  constructor(element: Element, name: string) {
    super((value: string) => {
      DynamicAttributeOnEmit(this, value);
    });
    ConstructDynamicAttribute(this, element, name);
  }

  get element(): Element {
    return DynamicAttributeGetElement(this);
  }

  get name(): string {
    return DynamicAttributeGetName(this);
  }
};
