import { Observer } from '@lifaon/observables';
import { IDynamicStyle, IDynamicStyleConstructor, TDynamicStyleValue } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ExtractUnit } from '../helpers';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

export const DYNAMIC_STYLE_PRIVATE = Symbol('dynamic-style-private');

export interface IDynamicStylePrivate {
  element: HTMLElement;
  property: string;
  unit: string | null;
}

export interface IDynamicStyleInternal extends IDynamicStyle {
  [DYNAMIC_STYLE_PRIVATE]: IDynamicStylePrivate;
}


export function ConstructDynamicStyle(dynamicStyle: IDynamicStyle, element: HTMLElement, name: string): void {
  ConstructClassWithPrivateMembers(dynamicStyle, DYNAMIC_STYLE_PRIVATE);
  BindObserverWithNodeStateObservable(dynamicStyle, element);
  (dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].element = element;
  [
    (dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].property,
    (dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].unit
  ] = ExtractUnit(name);
}

export function DynamicStyleOnEmit(dynamicStyle: IDynamicStyle, value: TDynamicStyleValue): void {
  if (value === null) {
    (dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].element.style.removeProperty((dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].property);
  } else {
    value = String(value);
    (dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].element.style.setProperty(
      (dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].property,
      ((dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].unit === null)
        ? value
        : (value + (dynamicStyle as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].unit)
    );
  }
}

export const DynamicStyle: IDynamicStyleConstructor = class DynamicStyle extends Observer<TDynamicStyleValue> implements IDynamicStyle {
  constructor(element: HTMLElement, name: string) {
    super((value: string) => {
      DynamicStyleOnEmit(this, value);
    });
    ConstructDynamicStyle(this, element, name);
  }

  get element(): HTMLElement {
    return ((this as unknown) as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].element;
  }

  get property(): string {
    return ((this as unknown) as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].property;
  }

  get unit(): string | null {
    return ((this as unknown) as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].unit;
  }
};
