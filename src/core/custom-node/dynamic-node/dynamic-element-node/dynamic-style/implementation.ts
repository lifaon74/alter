import { Observer } from '@lifaon/observables';
import { IDynamicStyle, IDynamicStyleConstructor, TDynamicStyleValue } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { IStylePropertyWithNameUnit, ParseStylePropertyWithNameAndUnit } from '../helpers';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';

/** PRIVATES **/

export const DYNAMIC_STYLE_PRIVATE = Symbol('dynamic-style-private');

export interface IDynamicStylePrivate {
  element: HTMLElement;
  property: string;
  unit: string | null;
}

export interface IDynamicStylePrivatesInternal extends IObserverPrivatesInternal<TDynamicStyleValue> {
  [DYNAMIC_STYLE_PRIVATE]: IDynamicStylePrivate;
}

export interface IDynamicStyleInternal extends IDynamicStylePrivatesInternal, IDynamicStyle {
}

/** CONSTRUCTOR **/

export function ConstructDynamicStyle(instance: IDynamicStyle, element: HTMLElement, name: string): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_STYLE_PRIVATE);
  BindObserverWithNodeStateObservable(instance, element);
  const privates: IDynamicStylePrivate = (instance as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE];
  privates.element = element;
  const stylePropertyWithNameUnit: IStylePropertyWithNameUnit = ParseStylePropertyWithNameAndUnit(name);
  privates.property = stylePropertyWithNameUnit.property;
  privates.unit = (stylePropertyWithNameUnit.unit === void 0) ? null : stylePropertyWithNameUnit.unit;
}

/** CONSTRUCTOR FUNCTIONS **/

export function DynamicStyleOnEmit(instance: IDynamicStyle, value: TDynamicStyleValue): void {
  const privates: IDynamicStylePrivate = (instance as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE];
  if (value === null) {
    privates.element.style.removeProperty(privates.property);
  } else {
    value = String(value);
    privates.element.style.setProperty(
      privates.property,
      (privates.unit === null)
        ? value
        : (value + privates.unit)
    );
  }
}

/** METHODS **/

/* GETTERS/SETTERS */

export function DynamicStyleGetElement(instance: IDynamicStyle): HTMLElement {
  return (instance as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].element;
}

export function DynamicStyleGetProperty(instance: IDynamicStyle): string {
  return (instance as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].property;
}

export function DynamicStyleGetUnit(instance: IDynamicStyle): string | null {
  return (instance as IDynamicStyleInternal)[DYNAMIC_STYLE_PRIVATE].unit;
}


/** CLASS **/

export const DynamicStyle: IDynamicStyleConstructor = class DynamicStyle extends Observer<TDynamicStyleValue> implements IDynamicStyle {
  constructor(element: HTMLElement, name: string) {
    super((value: TDynamicStyleValue) => {
      DynamicStyleOnEmit(this, value);
    });
    ConstructDynamicStyle(this, element, name);
  }

  get element(): HTMLElement {
    return DynamicStyleGetElement(this);
  }

  get property(): string {
    return DynamicStyleGetProperty(this);
  }

  get unit(): string | null {
    return DynamicStyleGetUnit(this);
  }
};
