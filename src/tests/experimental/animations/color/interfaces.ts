

/** TYPES **/

export interface IHSLAObject {
  h: number;
  s: number;
  l: number;
  a?: number;
}

/** INTERFACES **/


export interface IColorStatic {
  parse(input: string): IColor | null;
}

export interface IColorConstructor extends IColorStatic {
  new(r: number, g: number, b: number, a?: number): IColor;
}

export interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;


  /** OPERATIONS **/

  mix(color: IColor, proportion: number): IColor;


  /** CONVERT **/

  /**
   * Returns the css rgb or rgba color.
   */
  toRGB(alpha?: boolean): string;

  /**
   * Returns the css rgba color.
   */
  toRGBA(): string;

  /**
   * Returns the css hsl or hsla color.
   */
  toHSL(alpha?: boolean): string;

  /**
   * Returns the css hsla color.
   */
  toHSLA(): string;

  /**
   * Returns the css hex color.
   */
  toHex(alpha?: boolean): string;

  /**
   * Returns an HSLAObject
   */
  toHSLAObject(): IHSLAObject;

  toString(): string;
}

