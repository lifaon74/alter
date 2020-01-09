import { IObjectProperty } from './interfaces';


/** CLASS **/

export class ObjectProperty<TKey extends PropertyKey, TValue> implements IObjectProperty<TKey, TValue> {
  protected readonly _key: TKey;
  protected readonly _value: TValue;

  constructor(key: TKey, value: TValue) {
    this._key = key;
    this._value = value;
  }

  get key(): TKey {
    return this._key;
  }

  get value(): TValue {
    return this._value;
  }
}
