import { IObjectDeepProperty } from './interfaces';
import { IReadonlyList, ReadonlyList } from '@lifaon/observables';


/** CLASS **/

export class ObjectDeepProperty<TValue> implements IObjectDeepProperty<TValue> {
  protected readonly _path: IReadonlyList<PropertyKey>;
  protected readonly _value: TValue;

  constructor(path: Iterable<PropertyKey>, value: TValue) {
    this._path = new ReadonlyList(Array.from(path));
    this._value = value;
  }

  get path(): IReadonlyList<PropertyKey> {
    return this._path;
  }

  get value(): TValue {
    return this._value;
  }
}
