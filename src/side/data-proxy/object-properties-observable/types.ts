import { IObjectPropertyObserver } from '../object-property-observer/interfaces';
import { IObjectProperty } from '../object-property/interfaces';

export type TObjectToObjectProperties<TObject extends object> = ({
  [TKey in keyof TObject]: IObjectProperty<TKey, TObject[TKey]>;
})[keyof TObject];

export type TObjectToObjectPropertyObservers<TObject extends object> = ({
  [TKey in keyof TObject]: IObjectPropertyObserver<TKey, TObject[TKey]>;
})[keyof TObject];

// type B = TObjectToObjectProperties<{a: 'pok', b: 'a'}>;
