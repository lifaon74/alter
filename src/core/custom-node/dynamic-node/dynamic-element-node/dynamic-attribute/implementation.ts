import { IDynamicAttribute, IDynamicAttributeConstructor } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { Observer } from '@lifaon/observables';

export const DYNAMIC_ATTRIBUTE_PRIVATE = Symbol('dynamic-attribute-private');

export interface IDynamicAttributePrivate {
  element: Element;
  name: string;
}

export interface IDynamicAttributeInternal extends IDynamicAttribute {
  [DYNAMIC_ATTRIBUTE_PRIVATE]: IDynamicAttributePrivate;
}


export function ConstructDynamicAttribute(dynamicAttribute: IDynamicAttribute, element: Element, name: string): void {
  ConstructClassWithPrivateMembers(dynamicAttribute, DYNAMIC_ATTRIBUTE_PRIVATE);
  BindObserverWithNodeStateObservable(dynamicAttribute, element);
  (dynamicAttribute as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].element = element;
  (dynamicAttribute as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].name = name;
}

export function DynamicAttributeOnEmit(dynamicAttribute: IDynamicAttribute, value: string): void {
  if ((value === null) || (value === void 0)) {
    (dynamicAttribute as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].element.removeAttribute((dynamicAttribute as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].name);
  } else {
    (dynamicAttribute as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].element.setAttribute((dynamicAttribute as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].name, value);
  }
}

export const DynamicAttribute: IDynamicAttributeConstructor = class DynamicAttribute extends Observer<string> implements IDynamicAttribute {
  constructor(element: Element, name: string) {
    super((value: string) => {
      DynamicAttributeOnEmit(this, value);
    });
    ConstructDynamicAttribute(this, element, name);
  }

  get element(): Element {
    return ((this as unknown) as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].element;
  }

  get name(): string {
    return ((this as unknown) as IDynamicAttributeInternal)[DYNAMIC_ATTRIBUTE_PRIVATE].name;
  }
};
