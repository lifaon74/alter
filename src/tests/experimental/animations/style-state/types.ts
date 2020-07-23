export type TStylePropertyName = string;
export type TStylePropertyValue =
  string // any css value
  | undefined // compute css current value
  | null; // remove property

export type TStylePropertyTuple = [TStylePropertyName, TStylePropertyValue];

export interface TStyleStateObject {
  [key: string]: TStylePropertyValue;
}


export type TStyleStateTuples = Iterable<TStylePropertyTuple>;
export type TStyleStateMap = Map<TStylePropertyName, TStylePropertyValue>;

export type TStyleState = TStyleStateObject | TStyleStateTuples;

export type TStylePropertyChangeMap = Map<TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]>; // [name, [origin, target]]

