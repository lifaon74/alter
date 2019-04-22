
export interface IStyleConstructor {
  new(insert: TStyleFunction): IStyle;
}

export interface IStyle {
  insert: TStyleFunction;
}

export type TStyleFunction = (element: Element) => HTMLStyleElement;
