export type TObjectDeepPropertyObserverCallback<TValue> = (value: TValue) => void;

export interface IObjectDeepPropertyObserverLike<TValue> {
  path: Iterable<PropertyKey>;
  callback: TObjectDeepPropertyObserverCallback<TValue>;
}
