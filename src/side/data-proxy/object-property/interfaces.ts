
export interface IObjectProperty<TKey extends PropertyKey, TValue> {
  readonly key: TKey;
  readonly value: TValue;
}
