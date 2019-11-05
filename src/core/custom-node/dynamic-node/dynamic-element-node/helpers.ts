import { IsValidCSSIdentifier } from '../../../tokenizers/css';
import { uuid } from '../../../../misc/helpers/uuid';

/** CSS CLASS NAMES **/

/**
 * Extracts a list of class names from an array
 *  - expects array of well formed class names, or throws
 */
export function ExtractClassNamesFromArray(array: string[], classNames: Set<string> = new Set<string>()): Set<string> {
  for (let i = 0, l = array.length; i < l; i++) {
    const className: string = array[i];
    if (typeof className === 'string') {
      if (IsValidCSSIdentifier(className)) {
        classNames.add(className);
      } else {
        throw new SyntaxError(`Invalid class name at index ${ i }: '${ className }'.`);
      }
    } else {
      console.warn(array);
      throw new TypeError(`Expected string at index ${ i }, found: '${ className }'.`);
    }
  }
  return classNames;
}


/**
 * Extracts a list of class names from an iterable
 *  - expects iterator of well formed class names, or throws
 */
export function ExtractClassNamesFromIterable(iterable: Iterable<string>, classNames: Set<string> = new Set<string>()): Set<string> {
  const iterator: Iterator<string> = iterable[Symbol.iterator]();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    const className: string = result.value;
    if (typeof className === 'string') {
      if (IsValidCSSIdentifier(className)) {
        classNames.add(className);
      } else {
        throw new SyntaxError(`Invalid class name: '${ className }'.`);
      }
    } else {
      console.warn(iterable);
      throw new TypeError(`Expected string in iterator, found: '${ className }'.`);
    }
  }
  return classNames;
}

/**
 * Extracts a list of class names from an object.
 *  - for each property of an object as 'key', if object[key] evals to true, extracts class names from 'key' and add them to the list
 *  - expects object having well formed class names as keys, or throws.
 */
export function ExtractClassNamesFromObject(object: { [key: string]: boolean }, classNames: Set<string> = new Set<string>()): Set<string> {
  for (const key in object) {
    if (object.hasOwnProperty(key) && object[key]) {
      if (typeof key === 'string') {
        ExtractClassNamesFromString(key, classNames);
      } else {
        console.warn(object);
        throw new TypeError(`Expected string as key, found: '${ key }'.`);
      }
    }
  }
  return classNames;
}

/**
 * Extracts a list of class names from a string (split by spaces like the 'class' attribute).
 *  - expects string of well formed class names (separated by spaces), or throws
 */
export function ExtractClassNamesFromString(input: string, classNames: Set<string> = new Set<string>()): Set<string> {
  return ExtractClassNamesFromArray(
    input.split(' ')
      .map(_ => _.trim())
      .filter(_ => (_.length > 0)),
    classNames
  );
}

// types supported by ExtractClassNamesFromAny
export type TExtractClassNamesFromAny =
  null
  | undefined
  | string
  | string[]
  | Iterable<string>
  | { [key: string]: boolean };

/**
 * Extract a list of class names from an input.
 */
export function ExtractClassNamesFromAny(input: TExtractClassNamesFromAny, classNames: Set<string> = new Set<string>()): Set<string> {
  if ((input === null) || (input === void 0) || (input === '')) {
    return classNames;
  } else if (typeof input === 'object') {
    if (Array.isArray(input)) {
      return ExtractClassNamesFromArray(input as string[], classNames);
    } else if (Symbol.iterator in input) {
      return ExtractClassNamesFromIterable(input as Iterable<string>, classNames);
    } else {
      return ExtractClassNamesFromObject(input as { [key: string]: boolean }, classNames);
    }
  } else if (typeof input === 'string') {
    return ExtractClassNamesFromString(input, classNames);
  } else {
    console.warn(input);
    throw new TypeError(`Invalid input type.`);
  }
}


/*------------------------------------------------------------------------------------------------*/

/** STYLE **/

/**
 * Allows pattern like 'property.unit': value
 */
const STYLE_PROPERTY_NAME_AND_UNIT_EXTRACTOR_REGEXP: RegExp = new RegExp('\\.([a-zA-Z%]+)$');

// accepted name for a style property
export type TStylePropertyName = string;
// accepted value for a style property
export type TStylePropertyValue = string | number;


export interface IStylePropertyWithNameUnit {
  property: string;
  unit?: string;
}

export interface IStyleProperty {
  property: string;
  value: string;
}

export function IsStylePropertyValue(value: any): value is TStylePropertyValue {
  return (typeof value === 'string') || (typeof value === 'number');
}

/**
 * Extracts units (if present) from 'property', and returns tuple [property, unit].
 * @example: 'font-size.px' => ['font-size', 'px']
 * @example: 'color' => ['color']
 */
export function ParseStylePropertyWithNameAndUnit(property: TStylePropertyName): IStylePropertyWithNameUnit {
  STYLE_PROPERTY_NAME_AND_UNIT_EXTRACTOR_REGEXP.lastIndex = 0;
  const match: RegExpExecArray | null = STYLE_PROPERTY_NAME_AND_UNIT_EXTRACTOR_REGEXP.exec(property);
  if (match === null) {
    return {
      property: property.trim(),
    };
  } else {
    return {
      property: property.slice(0, -match[0].length).trim(),
      unit: match[1]
    };
  }
}

/**
 * Extracts units (if present) from 'property', and returns proper style tuple [property, value].
 * @example: ['font-size.px', 12] => ['font-size', '12px']
 */
export function ParseStyleProperty(property: TStylePropertyName, value: TStylePropertyValue): IStyleProperty {
  value = String(value);
  const stylePropertyWithNameUnit: IStylePropertyWithNameUnit = ParseStylePropertyWithNameAndUnit(property);
  return {
    property: stylePropertyWithNameUnit.property,
    value: (stylePropertyWithNameUnit.unit === null)
      ? value
      : (value + stylePropertyWithNameUnit.unit)
  };
}

/**
 * Inserts key / value in map. Extracts units if necessary.
 */
export function StyleKeyValueToMap(property: TStylePropertyName, value: TStylePropertyValue, map: Map<string, string>): void {
  const styleProperty: IStyleProperty = ParseStyleProperty(property, value);
  map.set(styleProperty.property, styleProperty.value);
}

export function ExtractStylesFromArray(array: [TStylePropertyName, TStylePropertyValue][], styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  for (let i = 0, l = array.length; i < l; i++) {
    const style: [TStylePropertyName, TStylePropertyValue] = array[i];
    if (
      Array.isArray(style)
      && (style.length === 2)
      && (typeof style[0] === 'string')
      && IsStylePropertyValue(style[1])
    ) {
      StyleKeyValueToMap(style[0], style[1], styles);
    } else {
      console.warn(array);
      throw new TypeError(`Expected [string, string | number] at index ${ i }, found: '${ style }'.`);
    }
  }
  return styles;
}

export function ExtractStylesFromIterable(iterable: Iterable<[TStylePropertyName, TStylePropertyValue]>, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  const iterator: Iterator<[TStylePropertyName, TStylePropertyValue]> = iterable[Symbol.iterator]();
  let result: IteratorResult<[TStylePropertyName, TStylePropertyValue]>;
  while (!(result = iterator.next()).done) {
    const style: [TStylePropertyName, TStylePropertyValue] = result.value;
    if (
      Array.isArray(style)
      && (style.length === 2)
      && (typeof style[0] === 'string')
      && IsStylePropertyValue(style[1])
    ) {
      StyleKeyValueToMap(style[0], style[1], styles);
    } else {
      console.warn(iterable);
      throw new TypeError(`Expected [string, string | number] in iterator, found: '${ style }'.`);
    }
  }
  return styles;
}

export function ExtractStylesFromObject(object: { [key: string]: TStylePropertyValue }, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  // return ExtractStylesFromArray(Object.entries<TStylePropertyValue>(object), styles);
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      if (typeof key === 'string') {
        const value: TStylePropertyValue = object[key];
        if (IsStylePropertyValue(value)) {
          StyleKeyValueToMap(key, value, styles);
        } else {
          console.warn(object);
          throw new TypeError(`Expected string or number as object['${ key }'], found: '${ value }'.`);
        }
      } else {
        console.warn(object);
        throw new TypeError(`Expected string as key, found: '${ key }'.`);
      }
    }
  }
  return styles;
}

export function ExtractStylesFromString(input: string, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  const id: string = uuid();
  input = input.trim();
  if (!input.endsWith(';')) {
    input += ';';
  }
  input = `[elt-${ id }] { ${ input } }`;

  const styleElement: HTMLStyleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(input));
  document.head.appendChild(styleElement);

  const sheet: CSSStyleSheet = styleElement.sheet as CSSStyleSheet;
  sheet.disabled = true;

  for (let i = 0, rulesLength = sheet.cssRules.length; i < rulesLength; i++) {
    const rule: CSSRule = sheet.cssRules[i];
    if (rule.type === CSSRule.STYLE_RULE) {
      for (let j = 0, stylesLength = (rule as CSSStyleRule).style.length; j < stylesLength; j++) {
        const property: string = (rule as CSSStyleRule).style.item(j);
        styles.set(property, (rule as CSSStyleRule).style.getPropertyValue(property));
      }
    }
  }

  document.head.removeChild(styleElement);

  return styles;
}


export type TExtractStylesFromAny =
  null
  | undefined
  | string
  | [string, TStylePropertyValue][]
  | Iterable<[string, TStylePropertyValue]>
  | { [key: string]: TStylePropertyValue };

export function ExtractStylesFromAny(input: TExtractStylesFromAny, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  if ((input === null) || (input === void 0) || (input as any === '')) {
    return styles;
  } else if (typeof input === 'object') {
    if (Array.isArray(input)) {
      return ExtractStylesFromArray(input as [string, TStylePropertyValue][], styles);
    } else if (Symbol.iterator in input) {
      return ExtractStylesFromIterable(input as Iterable<[string, TStylePropertyValue]>, styles);
    } else {
      return ExtractStylesFromObject(input as { [key: string]: TStylePropertyValue }, styles);
    }
  } else if (typeof input === 'string') {
    return ExtractStylesFromString(input, styles);
  } else {
    console.warn(input);
    throw new TypeError(`Invalid input type.`);
  }
}
