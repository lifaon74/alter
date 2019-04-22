import { IObserver } from '../../../../../core/observer/interfaces';

export interface IDynamicClassConstructor {
  new(element: Element, name: string): IDynamicClass;
}

export interface IDynamicClass extends IObserver<boolean> {
  readonly element: Element;
  readonly name: string;
}
