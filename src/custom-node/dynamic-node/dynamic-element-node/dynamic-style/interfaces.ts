import { IObserver } from '@lifaon/observables/public';

export interface IDynamicStyleConstructor {
  new(element: HTMLElement, name: string): IDynamicStyle;
}

export interface IDynamicStyle extends IObserver<TDynamicStyleValue> {
  readonly element: HTMLElement;
  readonly property: string;
  readonly unit: string | null;
}

export type TDynamicStyleValue = string | number | null;
