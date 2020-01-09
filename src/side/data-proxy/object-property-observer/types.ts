export type TObjectPropertyObserverCallback<TValue> = (value: TValue) => void;

export interface IObjectPropertyObserverLike<TKey extends PropertyKey, TValue> {
  key: TKey;
  callback: TObjectPropertyObserverCallback<TValue>;
}
