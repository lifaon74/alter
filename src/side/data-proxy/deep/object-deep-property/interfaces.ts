import { IReadonlyList } from '@lifaon/observables';

export interface IObjectDeepProperty<TValue> {
  readonly path: IReadonlyList<PropertyKey>;
  readonly value: TValue;
}
