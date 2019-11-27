import { Constructor } from '../../../classes/factory';
import { DestroyNode } from '../../custom-node/node-state-observable/mutations';


/**
 * HELPERS: reference all elements: tag names, constructors, etc...
 */

// RegExp used to detect if a property name is an HTMLElement's constructor
const HTML_ELEMENT_CONSTRUCTOR_REG_EXP: RegExp = new RegExp('^HTML(.+)Element$');

/**
 * Returns the list of all the classes which inherit of HTMLElement
 */
function GetHTMLElementConstructors(items: Set<Constructor<HTMLElement>> = new Set<Constructor<HTMLElement>>()): Set<Constructor<HTMLElement>> {
  const propertyNames: string[] = Object.getOwnPropertyNames(globalThis);
  for (let i = 0, l = propertyNames.length; i < l; i++) {
    const propertyName: string = propertyNames[i];
    if (HTML_ELEMENT_CONSTRUCTOR_REG_EXP.test(propertyName)) {
      items.add((globalThis as any)[propertyName]);
    }
  }
  return items;
}

/**
 * Returns the constructor for a specific tag's name
 */
function GetTagNameConstructor(tagName: string): Constructor<HTMLElement> {
  const element: HTMLElement = document.createElement(tagName);
  const _constructor: Constructor<HTMLElement> = element.constructor as any;
  DestroyNode(element);
  return _constructor;
}

/**
 * Creates/fills a map used to go from a tag's name to an HTMLElement's constructor
 */
function TagNamesToHTMLElementConstructors(
  tagNames: Iterable<string>,
  map: Map<string, Constructor<HTMLElement>> = new Map<string, Constructor<HTMLElement>>()
): Map<string, Constructor<HTMLElement>> {
  const iterator: Iterator<string> = tagNames[Symbol.iterator]();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    map.set(result.value, GetTagNameConstructor(result.value));
  }
  return map;
}

/**
 * Creates/fills a map used to go from an HTMLElement's constructor to a list of tag names
 */
function HTMLElementConstructorsToTagNames(
  tagNamesToConstructorsMap: Map<string, Constructor<HTMLElement>>,
  map: Map<Constructor<HTMLElement>, Set<string>> = new Map<Constructor<HTMLElement>, Set<string>>()
): Map<Constructor<HTMLElement>, Set<string>> {
  const iterator: Iterator<[string, Constructor<HTMLElement>]> = tagNamesToConstructorsMap.entries();
  let result: IteratorResult<[string, Constructor<HTMLElement>]>;
  while (!(result = iterator.next()).done) {
    const [tagName, _constructor]: [string, Constructor<HTMLElement>] = result.value;
    if (!map.has(_constructor)) {
      map.set(_constructor, new Set<string>());
    }
    (map.get(_constructor) as Set<string>).add(tagName);
  }
  return map;
}

// // https://www.tutorialrepublic.com/html-reference/html5-tags.php
// list of standard tagNames
const TAG_NAMES: Set<string> = new Set<string>([
  'a', 'article', 'aside', 'body', 'br', 'details', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'head', 'header', 'hgroup', 'hr', 'html', 'footer', 'nav', 'p', 'section', 'span', 'summary',

  'base', 'basefont', 'link', 'meta', 'style', 'title',

  'button', 'datalist', 'fieldset', 'form', 'input', 'keygen', 'label', 'legend', 'meter',
  'optgroup', 'option', 'select', 'textarea',

  'abbr', 'acronym', 'address', 'b', 'bdi', 'bdo', 'big', 'blockquote', 'center', 'cite', 'code',
  'del', 'dfn', 'em', 'font', 'i', 'ins', 'kbd', 'mark', 'output', 'pre', 'progress', 'q', 'rq',
  'rt', 'ruby', 's', 'samp', 'small', 'strike', 'strong', 'sub', 'sup', 'tt', 'u', 'var', 'wbr',

  'dd', 'dir', 'dl', 'dt', 'li', 'ol', 'menu', 'ul',

  'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'thead', 'th', 'tr',

  'noscript', 'script',

  'applet', 'area', 'audio', 'canvas', 'embed', 'figcaption', 'figure', 'frame', 'frameset',
  'iframe', 'img', 'map', 'noframes', 'object', 'param', 'source', 'time', 'video',

  'template', 'track', 'picture', 'dialog',
]);

// list of html constructors
// export const HTML_ELEMENT_CONSTRUCTORS: Set<Constructor<HTMLElement>> = new Set<Constructor<HTMLElement>>();
export const HTML_ELEMENT_CONSTRUCTORS: Set<Constructor<HTMLElement>> = GetHTMLElementConstructors();

// map from tag names to constructors
// export const TAG_NAMES_TO_HTML_ELEMENT_CONSTRUCTORS_MAP: Map<string, Constructor<HTMLElement>> = new Map<string, Constructor<HTMLElement>>();
export const TAG_NAMES_TO_HTML_ELEMENT_CONSTRUCTORS_MAP: Map<string, Constructor<HTMLElement>> = TagNamesToHTMLElementConstructors(TAG_NAMES);

// map from constructors to tag names
// export const htmlElementConstructorsToTagNamesMap: Map<Constructor<HTMLElement>, Set<string>> = new Map<Constructor<HTMLElement>, Set<string>>();
export const HTML_ELEMENT_CONSTRUCTORS_TO_TAG_NAMES_MAP: Map<Constructor<HTMLElement>, Set<string>> = HTMLElementConstructorsToTagNames(TAG_NAMES_TO_HTML_ELEMENT_CONSTRUCTORS_MAP);


function VerifyHTMLElementConstructorsMapping(
  htmlElementConstructors: Iterable<Constructor<HTMLElement>>,
  htmlElementConstructorsToTagNamesMap: Map<Constructor<HTMLElement>, any>
): Constructor<HTMLElement>[] {
  const missingConstructors: Constructor<HTMLElement>[] = [];
  const iterator: Iterator<Constructor<HTMLElement>> = htmlElementConstructors[Symbol.iterator]();
  let result: IteratorResult<Constructor<HTMLElement>>;
  while (!(result = iterator.next()).done) {
    if (!htmlElementConstructorsToTagNamesMap.has(result.value)) {
      missingConstructors.push(result.value);
    }
  }
  return missingConstructors;
}


// function init(): void {
//   GetHTMLElementConstructors(htmlElementConstructors);
//   TagNamesToHTMLElementConstructors(tagNames, tagNamesToHTMLElementConstructorsMap);
//   HTMLElementConstructorsToTagNames(tagNamesToHTMLElementConstructorsMap, htmlElementConstructorsToTagNamesMap);
// }


/**
 * Registers a new HTMLElement into our maps and lists
 */
export function RegisterHTMLElement(tagName: string, _constructor?: Constructor<HTMLElement>, verify: boolean = false): void {
  if (_constructor === void 0) {
    _constructor = GetTagNameConstructor(tagName);
  } else if (verify) {
    const _constructor_: any = GetTagNameConstructor(tagName);
    if (_constructor !== _constructor_) {
      throw new Error(`Creating element '${ tagName }' didn't result in an '${ _constructor.name } but as '${ _constructor_.name }'`);
    }
  }

  // tags are uniq
  if (TAG_NAMES.has(tagName)) {
    throw new Error(`Tag '${ tagName }' already used`);
  } else {
    TAG_NAMES.add(tagName);
  }

  HTML_ELEMENT_CONSTRUCTORS.add(_constructor);
  TAG_NAMES_TO_HTML_ELEMENT_CONSTRUCTORS_MAP.set(tagName, _constructor);

  if (!HTML_ELEMENT_CONSTRUCTORS_TO_TAG_NAMES_MAP.has(_constructor)) {
    HTML_ELEMENT_CONSTRUCTORS_TO_TAG_NAMES_MAP.set(_constructor, new Set<string>());
  }
  (HTML_ELEMENT_CONSTRUCTORS_TO_TAG_NAMES_MAP.get(_constructor) as Set<string>).add(tagName);
}

