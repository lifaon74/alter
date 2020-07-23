/** MISSING TYPES **/

// https://www.w3.org/TR/css-typed-om-1/#csstransformcomponent

export interface ICSSStyleValue {

}

export interface ICSSStyleValueStatic {
  parse(property: string, cssText: string): ICSSStyleValue;
}

/*---*/


export interface ICSSVariableReferenceValue {
  variable: string;
  readonly fallback?: ICSSUnparsedValue;
}

export type ICSSUnparsedSegment = string | ICSSVariableReferenceValue;

export interface ICSSUnparsedValue extends ICSSStyleValue {
  readonly length: number;
  [Symbol.iterator]: ICSSUnparsedSegment;

  [index: number]: ICSSUnparsedSegment;
}


/*---*/

export interface ICSSKeywordValueConstructor {
  new(value: string): ICSSKeywordValue;
}

export interface ICSSKeywordValue extends ICSSStyleValue {
  value: string;
}

/*---*/

export type ICSSNumberish = number | ICSSNumericValue;

export type ICSSNumericBaseType =
  'length'
  | 'angle'
  | 'time'
  | 'frequency'
  | 'resolution'
  | 'flex'
  | 'percent';

export interface ICSSNumericType {
  length?: number;
  angle?: number;
  time?: number;
  frequency?: number;
  resolution?: number;
  flex?: number;
  percent?: number;
  percentHint?: ICSSNumericBaseType;
}

export interface ICSSNumericValue extends ICSSStyleValue {
  add(...values: ICSSNumberish[]): ICSSNumericValue;

  sub(...values: ICSSNumberish[]): ICSSNumericValue;

  mul(...values: ICSSNumberish[]): ICSSNumericValue;

  div(...values: ICSSNumberish[]): ICSSNumericValue;

  min(...values: ICSSNumberish[]): ICSSNumericValue;

  max(...values: ICSSNumberish[]): ICSSNumericValue;

  equals(...values: ICSSNumberish[]): boolean;

  to(unit: string): ICSSUnitValue;

  toSum(units: string[]): ICSSMathSum;

  type(): ICSSNumericType;
}

/*---*/

export type ICSSMathOperator =
  'sum'
  | 'product'
  | 'negate'
  | 'invert'
  | 'min'
  | 'max'
  | 'clamp';

export interface ICSSMathValue extends ICSSNumericValue {
  readonly operator: ICSSMathOperator;
}

/*---*/

export interface ICSSNumericArray {
  readonly length: number;

  [Symbol.iterator](): ICSSNumericValue;

  [key: number]: ICSSNumericValue;
}

/*---*/

export interface ICSSMathSum extends ICSSMathValue {
  readonly values: ICSSNumericArray;
}


/*---*/

export interface ICSSUnitValueConstructor extends ICSSStyleValueStatic {
  new(value: number, unit: string): ICSSUnitValue;
}

export interface ICSSUnitValue extends ICSSNumericValue {
  value: number;
  readonly unit: string;
}

/*---*/

export interface ICSSTransformComponent {
  is2D: boolean;

  toMatrix(): DOMMatrix;
}

export interface ICSSTransformValueStatic extends ICSSStyleValueStatic {
}

export interface ICSSTransformValueConstructor extends ICSSTransformValueStatic {
  new(transforms: Iterable<ICSSTransformComponent>): ICSSTransformValue;
}

export interface ICSSTransformValue extends ICSSStyleValue {
  readonly length: number;
  readonly is2D: boolean;

  toMatrix(): DOMMatrix;

  [key: number]: ICSSTransformComponent;

  [Symbol.iterator]: Generator<ICSSTransformComponent>
}


export interface ICSSMatrixComponentOptions {
  is2D: boolean;
}

export interface ICSSMatrixComponentConstructor extends ICSSTransformValueStatic {
  new(matrix: DOMMatrixReadOnly, options?: ICSSMatrixComponentOptions): ICSSMatrixComponent;
}

export interface ICSSMatrixComponent extends ICSSTransformComponent {
  matrix: DOMMatrix;
}


/*---*/

export interface ICSSStatic {
  number(value: number): ICSSUnitValue;

  percent(value: number): ICSSUnitValue;

  // <length>
  em(value: number): ICSSUnitValue;

  ex(value: number): ICSSUnitValue;

  ch(value: number): ICSSUnitValue;

  ic(value: number): ICSSUnitValue;

  rem(value: number): ICSSUnitValue;

  lh(value: number): ICSSUnitValue;

  rlh(value: number): ICSSUnitValue;

  vw(value: number): ICSSUnitValue;

  vh(value: number): ICSSUnitValue;

  vi(value: number): ICSSUnitValue;

  vb(value: number): ICSSUnitValue;

  vmin(value: number): ICSSUnitValue;

  vmax(value: number): ICSSUnitValue;

  cm(value: number): ICSSUnitValue;

  mm(value: number): ICSSUnitValue;

  Q(value: number): ICSSUnitValue;

  in(value: number): ICSSUnitValue;

  pt(value: number): ICSSUnitValue;

  pc(value: number): ICSSUnitValue;

  px(value: number): ICSSUnitValue;

  // <angle>
  deg(value: number): ICSSUnitValue;

  grad(value: number): ICSSUnitValue;

  rad(value: number): ICSSUnitValue;

  turn(value: number): ICSSUnitValue;

  // <time>
  s(value: number): ICSSUnitValue;

  ms(value: number): ICSSUnitValue;

  // <frequency>
  Hz(value: number): ICSSUnitValue;

  kHz(value: number): ICSSUnitValue;

  // <resolution>
  dpi(value: number): ICSSUnitValue;

  dpcm(value: number): ICSSUnitValue;

  dppx(value: number): ICSSUnitValue;

  // <flex>
  fr(value: number): ICSSUnitValue;
}

/*---*/

declare const CSSStyleValue: ICSSStyleValueStatic;
declare const CSSKeywordValue: ICSSKeywordValueConstructor;
declare const CSSUnitValue: ICSSUnitValueConstructor;
declare const CSSNumericValue: ICSSStyleValueStatic;
declare const CSSTransformValue: ICSSTransformValueConstructor;
declare const CSSMatrixComponent: ICSSMatrixComponentConstructor;
declare const CSS: ICSSStatic;

