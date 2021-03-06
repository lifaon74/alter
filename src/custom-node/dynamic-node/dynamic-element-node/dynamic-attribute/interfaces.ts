import { IObserver } from '@lifaon/observables';

export interface IDynamicAttributeConstructor {
  new(element: Element, name: string): IDynamicAttribute;
}

export interface IDynamicAttribute extends IObserver<string> {
  readonly element: Element;
  readonly name: string;
}
