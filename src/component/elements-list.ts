import { DestroyNode } from '../custom-node/node-state-observable/mutations';
import { Constructor } from '../classes/factory';


/**
 * Returns the list of all the class which inherits of HTMLElement
 */
function GetHTMLElementConstructors(items: Set<Constructor<HTMLElement>> = new Set<Constructor<HTMLElement>>()): Set<Constructor<HTMLElement>> {
  const reg: RegExp = new RegExp('^HTML(.+)Element$');
  for (const key of Object.getOwnPropertyNames(window)) {
    if (reg.exec(key) !== null) {
      items.add((window as any)[key]);
    }
  }
  return items;
}

function GetTagNameConstructor(tagName: string): Constructor<HTMLElement> {
  const element: HTMLElement = document.createElement(tagName);
  const _constructor: Constructor<HTMLElement> = element.constructor as any;
  DestroyNode(element);
  return _constructor;
}

/**
 * Maps a list of tags with the associated constructors
 * @param tagNames
 * @param map
 */
function TagNamesToHTMLElementConstructors(
  tagNames: Iterable<string>,
  map: Map<string, Constructor<HTMLElement>> = new Map<string, Constructor<HTMLElement>>()
): Map<string, Constructor<HTMLElement>> {
  for (const tagName of tagNames) {
    map.set(tagName, GetTagNameConstructor(tagName));
  }
  return map;
}

function HTMLElementConstructorsToTagNames(
  tagNamesToConstructorsMap: Map<string, Constructor<HTMLElement>>,
  map: Map<Constructor<HTMLElement>, Set<string>> = new Map<Constructor<HTMLElement>, Set<string>>()
): Map<Constructor<HTMLElement>, Set<string>> {
  for (const [tagName, _constructor] of tagNamesToConstructorsMap.entries()) {
    if (!map.has(_constructor)) {
      map.set(_constructor, new Set<string>());
    }
    map.get(_constructor).add(tagName);
  }
  return map;
}

// // https://www.tutorialrepublic.com/html-reference/html5-tags.php
// list of standard tagNames
const tagNames: Set<string> = new Set<string>([
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

  'applet', 'area', 'audio', 'canvas', 'embed', 'figcaption', 'figure',  'frame', 'frameset',
  'iframe', 'img', 'map', 'noframes', 'object', 'param', 'source',  'time', 'video',

  'template', 'track', 'picture', 'dialog',
]);

// list of html constructors
// export const htmlElementConstructors: Set<Constructor<HTMLElement>> = new Set<Constructor<HTMLElement>>();
export const htmlElementConstructors: Set<Constructor<HTMLElement>> = GetHTMLElementConstructors();

// map from tag names to constructors
// export const tagNamesToHTMLElementConstructorsMap: Map<string, Constructor<HTMLElement>> = new Map<string, Constructor<HTMLElement>>();
export const tagNamesToHTMLElementConstructorsMap: Map<string, Constructor<HTMLElement>> = TagNamesToHTMLElementConstructors(tagNames);

// map from constructors to tag names
// export const htmlElementConstructorsToTagNamesMap: Map<Constructor<HTMLElement>, Set<string>> = new Map<Constructor<HTMLElement>, Set<string>>();
export const htmlElementConstructorsToTagNamesMap: Map<Constructor<HTMLElement>, Set<string>> = HTMLElementConstructorsToTagNames(tagNamesToHTMLElementConstructorsMap);


function VerifyHTMLElementConstructorsMapping(
  htmlElementConstructors: Iterable<Constructor<HTMLElement>>,
  htmlElementConstructorsToTagNamesMap: Map<Constructor<HTMLElement>, any>
): Constructor<HTMLElement>[] {
  const missingConstructors: Constructor<HTMLElement>[] = [];
  for (const _constructor of htmlElementConstructors) {
    if (!htmlElementConstructorsToTagNamesMap.has(_constructor)) {
      missingConstructors.push(_constructor);
    }
  }
  return missingConstructors;
}


// function init(): void {
//   GetHTMLElementConstructors(htmlElementConstructors);
//   TagNamesToHTMLElementConstructors(tagNames, tagNamesToHTMLElementConstructorsMap);
//   HTMLElementConstructorsToTagNames(tagNamesToHTMLElementConstructorsMap, htmlElementConstructorsToTagNamesMap);
// }



export function RegisterHTMLElement(tagName: string, _constructor?: Constructor<HTMLElement>, verify: boolean = false): void {
  if (_constructor === void 0) {
    _constructor = GetTagNameConstructor(tagName);
  } else if (verify) {
    const _constructor_: any = GetTagNameConstructor(tagName);
    if (_constructor !== _constructor_) {
      throw new Error(`Creating element '${tagName}' didn't result in an '${_constructor.name} but as '${_constructor_.name}'`);
    }
  }

  // tags are uniq
  if (tagNames.has(tagName)) {
    throw new Error(`Tag '${tagName}' already used`);
  } else {
    tagNames.add(tagName);
  }

  htmlElementConstructors.add(_constructor);
  tagNamesToHTMLElementConstructorsMap.set(tagName, _constructor);

  if (!htmlElementConstructorsToTagNamesMap.has(_constructor)) {
    htmlElementConstructorsToTagNamesMap.set(_constructor, new Set<string>());
  }
  htmlElementConstructorsToTagNamesMap.get(_constructor).add(tagName);
}

