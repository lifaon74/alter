import { IObserver } from '@lifaon/observables';

export interface IDynamicPropertyConstructor {
  new<T>(node: Node, name: string): IDynamicProperty<T>;
}

export interface IDynamicProperty<T> extends IObserver<T> {
  readonly node: Node;
  readonly name: string;
}
