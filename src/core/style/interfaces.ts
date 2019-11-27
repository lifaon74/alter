
/** INTERFACES **/

export interface IStyleConstructor {
  new(insert: TStyleFunction): IStyle;
}

export interface IStyle {
  insert: TStyleFunction;
}

/** TYPES **/

export type TStyleFunction = (element: Element) => HTMLStyleElement;
