import { IColor, IColorConstructor, IHSLAObject } from './interfaces';
import { ConstructClassWithPrivateMembers } from '@lifaon/class-factory';

/** PRIVATES **/

export const COLOR_PRIVATE = Symbol('color-private');

export interface IColorPrivate {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface IColorInternal extends IColor {
  [COLOR_PRIVATE]: IColorPrivate;
}

/** CONSTRUCTOR **/

export function ConstructColor(
  instance: IColor,
  r: number,
  g: number,
  b: number,
  a: number,
): void {
  ConstructClassWithPrivateMembers(instance, COLOR_PRIVATE);
  const privates: IColorPrivate = (instance as IColorInternal)[COLOR_PRIVATE];
  privates.r = NormalizeColorValue(r, 'r');
  privates.g = NormalizeColorValue(g, 'g');
  privates.b = NormalizeColorValue(b, 'b');
  privates.a = NormalizeColorValue(a, 'a');
}


/** FUNCTIONS **/

export function NormalizeColorValue(value: number, name: string): number {
  if (typeof value === 'number') {
    if ((0 <= value) && (value <= 1)) {
      return value;
    } else {
      throw new RangeError(`Expected Color.${ name } in the range [0, 1]`);
    }
  } else {
    throw new TypeError(`Expected number as Color.${ name }`);
  }
}

const NUMBER_PATTERN: string = '\\s*(\\d+(?:\\.\\d+)?%?)\\s*';
const RGBA_REGEXP: RegExp = new RegExp('rgb(a)?\\(' + NUMBER_PATTERN + ',' + NUMBER_PATTERN + ',' + NUMBER_PATTERN + '(?:,' + NUMBER_PATTERN + ')?\\)');

/**
 * Converts a string (looking like a number) to a real number.
 * INFO: percents are allowed
 */
function ParseNumber(input: string, min: number, max: number): number {
  input = input.trim();
  let number: number = parseFloat(input);
  if (Number.isNaN(number)) {
    throw new Error(`Invalid number: ${ input }`);
  } else {
    if (input.endsWith('%')) {
      number *= max / 100;
    }

    if((min <= number) && (number <= max)) {
      return number;
    } else {
      throw new RangeError(`Invalid range [${ min }-${ max}] for number ${ number }`);
    }
  }
}

function NumberToHex(value: number, digits: number = 2): string {
  return value.toString(16).padStart(digits, '0');
}


export function ColorFromRGBString(input: string): IColor {
  RGBA_REGEXP.lastIndex = 0;
  const match: RegExpExecArray | null = RGBA_REGEXP.exec(input);
  if ((match !== null) && (typeof match[1] === typeof match[5])) { // check if 3 params for rgb and 4 for rgba
      return new Color(
        ParseNumber(match[2], 0, 255) / 255,
        ParseNumber(match[3], 0, 255) / 255,
        ParseNumber(match[4], 0, 255) / 255,
        (match[5] === void 0)
          ? 1
          : ParseNumber(match[5], 0, 1)
      );
  } else {
    throw new Error(`Invalid rgb(a) color: ${ input }`);
  }
}


/** METHODS **/

/* GETTERS/SETTERS */

export function ColorGetR(instance: IColor): number {
  return (instance as IColorInternal)[COLOR_PRIVATE].r;
}

export function ColorSetR(instance: IColor, value: number): void {
  (instance as IColorInternal)[COLOR_PRIVATE].r = NormalizeColorValue(value, 'r');
}


export function ColorGetG(instance: IColor): number {
  return (instance as IColorInternal)[COLOR_PRIVATE].g;
}

export function ColorSetG(instance: IColor, value: number): void {
  (instance as IColorInternal)[COLOR_PRIVATE].g = NormalizeColorValue(value, 'g');
}


export function ColorGetB(instance: IColor): number {
  return (instance as IColorInternal)[COLOR_PRIVATE].b;
}

export function ColorSetB(instance: IColor, value: number): void {
  (instance as IColorInternal)[COLOR_PRIVATE].b = NormalizeColorValue(value, 'b');
}


export function ColorGetA(instance: IColor): number {
  return (instance as IColorInternal)[COLOR_PRIVATE].a;
}

export function ColorSetA(instance: IColor, value: number): void {
  (instance as IColorInternal)[COLOR_PRIVATE].a = NormalizeColorValue(value, 'a');
}


/* METHODS */

export function ColorMix(instance: IColor, color: IColor, proportion: number): IColor {
  if ((0 <= proportion) && (proportion <= 1)) {
    const _proportion: number = 1 - proportion;
    return new Color(
      ((instance.r * _proportion) + (color.r * proportion)),
      ((instance.g * _proportion) + (color.g * proportion)),
      ((instance.b * _proportion) + (color.b * proportion)),
      ((instance.a * _proportion) + (color.a * proportion)),
    );
  } else {
    throw new RangeError(`Expected 'proportion' in the range [0, 1]`);
  }
}


export function ColorToRGB(instance: IColor, alpha: boolean = false): string {
  const privates: IColorPrivate = (instance as IColorInternal)[COLOR_PRIVATE];
  return `rgb${ alpha ? 'a' : '' }(${ Math.round(privates.r * 255) }, ${ Math.round(privates.g * 255) }, ${ Math.round(privates.b * 255) }${ alpha ? (', ' + privates.a) : '' })`;
}

export function ColorToHSL(instance: IColor, alpha: boolean = false): string {
  const hsla: IHSLAObject = ColorToHSLAObject(instance);
  return `hsl${ alpha ? 'a' : '' }(${ hsla.h * 360 }, ${ hsla.s * 100 }%, ${ hsla.l * 100 }%${ alpha ? (', ' + hsla.a) : '' })`;
}

export function ColorToHSLAObject(instance: IColor): IHSLAObject {
  const privates: IColorPrivate = (instance as IColorInternal)[COLOR_PRIVATE];

  const max: number = Math.max(privates.r, privates.g, privates.b);
  const min : number= Math.min(privates.r, privates.g, privates.b);

  const hslaObject: IHSLAObject = {
    h: 0,
    s: 0,
    l: (max + min) / 2,
    a: privates.a
  };

  if(max === min) { // achromatic
    hslaObject.h = 0;
    hslaObject.s = 0;
  } else {
    const d: number = max - min;
    hslaObject.s = hslaObject.l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case privates.r:
        hslaObject.h = (privates.g - privates.b) / d + (privates.g < privates.b ? 6 : 0);
        break;
      case privates.g:
        hslaObject.h = (privates.b - privates.r) / d + 2;
        break;
      case privates.b:
        hslaObject.h = (privates.r - privates.g) / d + 4;
        break;
    }
    hslaObject.h /= 6;
  }

  return hslaObject;
}

export function ColorToHex(instance: IColor, alpha: boolean = false): string {
  const privates: IColorPrivate = (instance as IColorInternal)[COLOR_PRIVATE];
  return `#${ NumberToHex(Math.round(privates.r * 255), 2) }${ NumberToHex(Math.round(privates.g * 255), 2) }${ NumberToHex(Math.round(privates.b * 255), 2) }${  (alpha ? NumberToHex(Math.round(privates.a * 255), 2) : '') }`;
}


/* STATIC METHODS */

export function ColorStaticParse(ctor: IColorConstructor, input: string): IColor | null {
  const element: HTMLElement = document.createElement('div');
  element.style.setProperty('color', input);

  if (element.style.getPropertyValue('color')) {
    document.body.appendChild(element);
    const style: CSSStyleDeclaration = window.getComputedStyle(element);
    const rgbColor: string = style.color;
    document.body.removeChild(element);
    return ColorFromRGBString(rgbColor);
  } else {
    return null;
  }
}



/** CLASS **/

export class Color implements IColor {

  static parse(input: string): IColor | null {
    return ColorStaticParse(this, input);
  }

  constructor(
    r: number,
    g: number,
    b: number,
    a: number = 1,
  ) {
    ConstructColor(this, r, g, b, a)
  }

  get r(): number {
    return ColorGetR(this);
  }

  set r(value: number) {
    ColorSetR(this, value);
  }


  get g(): number {
    return ColorGetG(this);
  }

  set g(value: number) {
    ColorSetG(this, value);
  }


  get b(): number {
    return ColorGetB(this);
  }

  set b(value: number) {
    ColorSetB(this, value);
  }


  get a(): number {
    return ColorGetA(this);
  }

  set a(value: number) {
    ColorSetA(this, value);
  }

  mix(color: IColor, proportion: number): IColor {
    return ColorMix(this, color, proportion);
  }


  toRGB(alpha?: boolean): string {
    return ColorToRGB(this, alpha);
  }

  toRGBA(): string {
    return this.toRGB(true);
  }

  toHSL(alpha?: boolean) {
    return ColorToHSL(this, alpha);
  }

  toHSLA(): string {
    return this.toHSL(true);
  }

  toHex(alpha?: boolean): string {
    return ColorToHex(this, alpha);
  }

  toHSLAObject(): IHSLAObject {
    return ColorToHSLAObject(this);
  }

  toString(): string {
    return this.toRGBA();
  }
}
