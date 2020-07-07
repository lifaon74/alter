/** TYPES **/

export interface IStyleBuildOptions {
  displayRealStyle?: boolean; // (default: false)
}

/** INTERFACES **/

export interface IStyleStatic {
  fromString(css: string, options?: IStyleBuildOptions): IStyle;

  fromURL(url: string, options?: IStyleBuildOptions): Promise<IStyle>;

  fromRelativeURL(moduleURL: string, url: string, options?: IStyleBuildOptions): Promise<IStyle>;
}

export interface IStyleConstructor extends IStyleStatic {
  new(insert: TStyleFunction): IStyle;
}

export interface IStyle {
  insert: TStyleFunction;
}

/** TYPES **/

export type TStyleFunction = (element: Element) => HTMLStyleElement;
