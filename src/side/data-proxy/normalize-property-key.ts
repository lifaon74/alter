import { UnionToIntersection } from '../../classes/types';


export type TNormalizePropertyKey<TKey extends PropertyKey> =
  TKey extends number
    ? string
    : TKey;

export type TNormalizedPropertyKey = TNormalizePropertyKey<PropertyKey>;

export type TNormalizeObjectPropertyKeys<TObject extends Object> = UnionToIntersection<{
  [TKey in keyof TObject]: Record<TNormalizePropertyKey<TKey>, TObject[TKey]>;
}[keyof TObject]>;

// type a = TNormalizeObjectPropertyKeys<{ 0: 'a', b: 'c'}>;

export function NormalizePropertyKey<TKey extends PropertyKey>(key: TKey): TNormalizePropertyKey<TKey> {
  return (
    (typeof key === 'number')
      ? String(key)
      : key
  ) as TNormalizePropertyKey<TKey>;
}

