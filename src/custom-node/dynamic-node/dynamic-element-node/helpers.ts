import { IsValidCSSIdentifier } from '../../../classes/tokenizers/css';

/**
 * Expects array of well formed class names, or throws
 * @param array
 * @param classNames
 */
export function ExtractClassNamesFromArray(array: string[], classNames: Set<string> = new Set<string>()): Set<string> {
  for (let i = 0, l = array.length; i < l; i++) {
    const className: string = array[i];
    if (typeof className === 'string') {
      if (IsValidCSSIdentifier(className)) {
        classNames.add(className);
      } else {
        throw new SyntaxError(`Invalid class name at index ${i}: '${className}'.`);
      }
    } else {
      console.warn(array);
      throw new TypeError(`Expected string at index ${i}, found: '${className}'.`);
    }
  }
  return classNames;
}

/**
 * Expects iterator of well formed class names, or throws
 * @param iterable
 * @param classNames
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
        throw new SyntaxError(`Invalid class name: '${className}'.`);
      }
    } else {
      console.warn(iterable);
      throw new TypeError(`Expected string in iterator, found: '${className}'.`);
    }
  }
  return classNames;
}

/**
 * Expects object having well formed class names as keys, or throws.
 * Returns only class names where object[key] is true
 * @param object
 * @param classNames
 */
export function ExtractClassNamesFromObject(object: { [key: string]: boolean }, classNames: Set<string> = new Set<string>()): Set<string> {
  for (const key in object) {
    if (object[key]) {
      if (typeof key === 'string') {
        ExtractClassNamesFromString(key, classNames);
      } else {
        console.warn(object);
        throw new TypeError(`Expected string as key, found: '${key}'.`);
      }
    }
  }
  return classNames;
}

/**
 * Extracts a list of class names from a string.
 * Expects string of well formed class names, or throws
 * @param input
 * @param classNames
 */
export function ExtractClassNamesFromString(input: string, classNames: Set<string> = new Set<string>()): Set<string> {
  return ExtractClassNamesFromArray(
    input.split(' ')
      .map(_ => _.trim())
      .filter(_ => (_.length > 0)),
    classNames
  );
}


export type TExtractClassNamesFromAny = null | undefined | string | string[] | Iterable<string> | { [key: string]: boolean };

/**
 * Extract a list of class names from an input.
 * @param input
 * @param classNames
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


/**
 * Allows pattern like 'property.unit': value
 */
const StyleKeyExtractorRegExp: RegExp = new RegExp('\\.([a-zA-Z%]+)$');

/**
 * Extracts units from key if present, and returns tuple [key, unit].
 * @example: 'font-size.px' => ['font-size', 'px']
 * @example: 'color' => ['color', null]
 * @param key
 * @constructor
 */
export function ExtractUnit(key: string): [string, string | null] {
  StyleKeyExtractorRegExp.lastIndex = 0;
  const match: RegExpExecArray | null = StyleKeyExtractorRegExp.exec(key);
  if (match === null) {
    return [key.trim(), null];
  } else {
    return [key.slice(0, -match[0].length).trim(), match[1]];
  }
}

export type TStyleValue = string | number;

/**
 * Extracts units from key if present, and returns proper style tuple.
 * @example: ['font-size.px', 12] => ['font-size', '12px']
 * @param key
 * @param value
 */
export function ParseStyleKeyValue(key: string, value: TStyleValue): [string, string] {
  value = String(value);
  const [_key, unit] = ExtractUnit(key);
  return [_key, (unit === null) ? value : (value + unit)];
}

/**
 * Inserts key / value in map. Extracts units if necessary.
 * @param key
 * @param value
 * @param map
 */
export function StyleKeyValueToMap(key: string, value: TStyleValue, map: Map<string, string>): void {
  [key, value] = ParseStyleKeyValue(key, value);
  map.set(key, value);
}

export function ExtractStylesFromArray(array: [string, TStyleValue][], styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  for (let i = 0, l = array.length; i < l; i++) {
    const style: [string, TStyleValue] = array[i];
    if (
      Array.isArray(style)
      && (style.length === 2)
      && (typeof style[0] === 'string')
      && (typeof style[1] === 'string')
    ) {
      StyleKeyValueToMap(style[0], style[1], styles);
    } else {
      console.warn(array);
      throw new TypeError(`Expected [string, string] at index ${i}, found: '${style}'.`);
    }
  }
  return styles;
}

export function ExtractStylesFromIterable(iterable: Iterable<[string, TStyleValue]>, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  const iterator: Iterator<[string, TStyleValue]> = iterable[Symbol.iterator]();
  let result: IteratorResult<[string, TStyleValue]>;
  while (!(result = iterator.next()).done) {
    const style: [string, TStyleValue] = result.value;
    if (
      Array.isArray(style)
      && (style.length === 2)
      && (typeof style[0] === 'string')
      && (typeof style[1] === 'string')
    ) {
      StyleKeyValueToMap(style[0], style[1], styles);
    } else {
      console.warn(iterable);
      throw new TypeError(`Expected [string, string] in iterator, found: '${style}'.`);
    }
  }
  return styles;
}

export function ExtractStylesFromObject(object: { [key: string]: TStyleValue }, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  for (const key in object) {
    if (typeof key === 'string') {
      const value: TStyleValue = object[key];
      const typeofValue: string = typeof value;
      if ((typeofValue === 'string') || (typeofValue === 'number')) {
        StyleKeyValueToMap(key, String(object[key]), styles);
      } else {
        console.warn(object);
        throw new TypeError(`Expected string or number as object['${key}'], found: '${value}'.`);
      }
    } else {
      console.warn(object);
      throw new TypeError(`Expected string as key, found: '${key}'.`);
    }
  }
  return styles;
}

export function ExtractStylesFromString(input: string, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  const id: string = Date.now().toString(16) + '-' + Math.floor(Math.random() * 1e15).toString(16);
  if (!input.endsWith(';')) {
    input += ';'
  }
  input = `[elt-${id}] { ${input} }`;

  const styleElement: HTMLStyleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(input));
  document.head.appendChild(styleElement);
  styleElement.sheet.disabled = true;

  const sheet: CSSStyleSheet = styleElement.sheet as CSSStyleSheet;
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


export type TExtractStylesFromAny = null | undefined | string | [string, TStyleValue][] | Iterable<[string, TStyleValue]> | { [key: string]: TStyleValue };

export function ExtractStylesFromAny(input: TExtractStylesFromAny, styles: Map<string, string> = new Map<string, string>()): Map<string, string> {
  if ((input === null) || (input === void 0) || (input as any === '')) {
    return styles;
  } else if (typeof input === 'object') {
    if (Array.isArray(input)) {
      return ExtractStylesFromArray(input as [string, TStyleValue][], styles);
    } else if (Symbol.iterator in input) {
      return ExtractStylesFromIterable(input as Iterable<[string, TStyleValue]>, styles);
    } else {
      return ExtractStylesFromObject(input as { [key: string]: TStyleValue }, styles);
    }
  } else if (typeof input === 'string') {
    return ExtractStylesFromString(input, styles);
  } else {
    console.warn(input);
    throw new TypeError(`Invalid input type.`);
  }
}
