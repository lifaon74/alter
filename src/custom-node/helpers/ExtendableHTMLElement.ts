
/**
 * ExtendableHTMLElement: Constructor for a HTMLElement. Takes the element name as input.
 * How it works:
 *   1) It extends HTMLElement, by setting its prototype with the HTMLElement's prototype
 *   2) When creating a new instance:
 *      a) It creates an element with 'createElement' (only way to create a element)
 *      b) It updates the element's prototype with 'this' prototype
 *          (which may me a mother class of this, so a mother class of an Element)
 *      c) The element is returned as the new 'this'
 */


export const ExtendableHTMLElement: (new(name: string, doc?: Document) => HTMLElement) = function ExtendableElement(name: string, doc: Document = document): HTMLElement {
  return Object.setPrototypeOf(doc.createElement(name), Object.getPrototypeOf(this));
} as any;
ExtendableHTMLElement.prototype = HTMLElement.prototype;

