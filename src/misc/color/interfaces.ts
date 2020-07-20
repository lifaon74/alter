/** TYPES **/

export interface IHSLAObject {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export type TGrayScaleMode =
  'lightness'
  | 'average'
  | 'luminosity'; // (default)

/** INTERFACES **/


export interface IColorStatic {
  parse(input: string): IColor | null;
  fromHSLAObject(hslaObject: IHSLAObject): IColor;
}

export interface IColorConstructor extends IColorStatic {
  new(r: number, g: number, b: number, a?: number): IColor;
}

export interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;

  /** COMPARISION **/

  equals(color: IColor): boolean;

  /** OPERATIONS **/

  // https://www.w3schools.com/sass/sass_functions_color.asp#:~:text=Sass%20Get%20Color%20Functions&text=Returns%20the%20blue%20value%20of,number%20between%200%20and%20255.&text=Returns%20the%20hue%20of%20color%20as%20a%20number%20between%200deg%20and%20255deg.&text=Returns%20the%20HSL%20saturation%20of,between%200%25%20and%20100%25.&text=Returns%20the%20HSL%20lightness%20of,between%200%25%20and%20100%25.

  mix(color: IColor, proportion: number): IColor;

  grayscale(mode?: TGrayScaleMode): IColor;

  invert(amount?: number): IColor;

  lighten(amount: number): IColor;

  darken(amount: number): IColor;

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

