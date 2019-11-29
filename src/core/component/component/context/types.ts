/** TYPES **/

export interface IComponentContextAttributeListenerKeyValueMap {
  [key: string]: IAttributeChange<any>;
}

export interface IAttributeChange<T> {
  previous: T;
  current: T;
}
