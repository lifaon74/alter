/**
 * Returns the character's length of an html attribute including: name="value"
 */
import nodeResolve from 'rollup-plugin-node-resolve';

function GetCharacterLengthOfAttribute(attribute: Attr): number {
  return attribute.name.length
    + ((attribute.value.length > 0) ? (attribute.value.length + 3 /* ="" */) : 0);
}

/**
 * Returns the character's length of the opening tag of an Element
 */
function GetCharacterLengthOfStartTag(node: Element): number {
  let length: number = node.tagName.length + 2; // <>
  for (let i = 0, l = node.attributes.length; i < l; i++) {
    length += 1 /* SPACE */ + GetCharacterLengthOfAttribute(node.attributes[i]);
  }
  return length;
}

/**
 * Returns the character's length of a Node
 */
function GetCharacterLengthOfNode(node: Node): number {
  switch (node.nodeType) {
    case Node.COMMENT_NODE:
      return (node as Comment).data.length + 7; // <!---->
    case Node.TEXT_NODE:
      return (node as Text).data.length;
    case Node.ELEMENT_NODE:
      return (node as Element).outerHTML.length;
    default:
      console.log(node);
      throw new Error(`Unsupported node type`);
  }
}

/**
 * Returns the character's position of a Node
 */
function GetCharacterPositionOfNode(node: Node, rootNode: Node | null = node.ownerDocument): number {
  if ((node === rootNode) || (rootNode === null)) {
    return 0;
  } else {
    let length: number = 0;
    let _node: Node | null = node;
    while ((_node = _node.previousSibling) !== null) {
      length += GetCharacterLengthOfNode(_node);
    }
    if ((node.parentElement) !== null && (node.parentElement !== rootNode)) {
      length += GetCharacterLengthOfStartTag(node.parentElement);
      length += GetCharacterPositionOfNode(node.parentElement, rootNode);
    }
    return length;
  }
}

/**
 * Returns the character's position of an html attribute
 */
function GetCharacterPositionOfAttribute(attribute: Attr, rootNode: Node | null = attribute.ownerElement): number {
  const ownerElement: Element | null = attribute.ownerElement;
  if (ownerElement === null) {
    return 0;
  } else {
    let length: number = ownerElement.tagName.length + 1; // <>
    for (let i = 0, l = ownerElement.attributes.length; i < l; i++) {
      length += 1; // SPACE
      if (ownerElement.attributes[i] === attribute) {
        break;
      } else {
        length += GetCharacterLengthOfAttribute(ownerElement.attributes[i]);
      }
    }
    return GetCharacterPositionOfNode(ownerElement, rootNode) + length;
  }
}

/**
 * Returns the start and end character's position of a Node
 */
function GetCharacterRangeOfNode(node: Node, rootNode?: Node): [number, number] {
  const position: number = GetCharacterPositionOfNode(node, rootNode);
  return [position, position + GetCharacterLengthOfNode(node)];
}

/**
 * Returns the start and end character's position of an html attribute
 */
function GetCharacterRangeOfAttribute(attribute: Attr, rootNode?: Node): [number, number] {
  const position: number = GetCharacterPositionOfAttribute(attribute, rootNode);
  return [position, position + GetCharacterLengthOfAttribute(attribute)];
}


/*--------*/

/** FUNCTIONS **/

export function GetTopParentElementOfNode<T extends Node>(node: Node): T {
  while (node.parentElement) {
    node = node.parentElement;
  }
  return node as T;
}



/** METHODS **/

/* STATIC */

export function HTMLTemplateErrorStaticCreateMessage(message: string, template: string, start: number, end: number): string {
  return message + ', '
    + 'in template: \n\n'
    + template.substring(start - 100, start) + '■■■'
    + template.substring(start, end)
    + '■■■' + template.substring(end, end + 100) + '\n'
    ;

  // const lines: string[] = template.split('\n');
  // let startLine: number = -1;
  // let endLine: number = -1;
  // let length: number = 0;
  //
  // for (let i = 0, l = lines.length; i < l; i++) {
  //   length += lines[i].length;
  //   if ((startLine === -1) && (length >= start)) {
  //     startLine = i;
  //   }
  //
  //   if (length >= end) {
  //     endLine = i;
  //     break;
  //   }
  // }
  //
  // console.log(startLine, endLine);
  // return message + '\n'
  //   + 'in template: \n'
  //   + ((startLine > 0) ? '...\n' : '')
  //   + lines.slice(startLine, endLine).join('\n') + '\n'
  //   + ((endLine < lines.length) ? '...\n' : '')
  //   ;
}

export function HTMLTemplateErrorStaticFromElement(_constructor: typeof HTMLTemplateError, message: string, node: Element, rootNode: Element): HTMLTemplateError {
  return new _constructor(message, rootNode.innerHTML, ...GetCharacterRangeOfNode(node, rootNode));
}

export function HTMLTemplateErrorStaticFromAttribute(_constructor: typeof HTMLTemplateError, message: string, attribute: Attr, rootNode: Element): HTMLTemplateError {
  return new _constructor(message, rootNode.innerHTML, ...GetCharacterRangeOfAttribute(attribute, rootNode));
}

/** CLASS **/

export class HTMLTemplateError extends Error {

  static getTopParent<T extends Node>(node: Node): T {
    return GetTopParentElementOfNode<T>(node);
  }

  static createMessage(message: string, template: string, start: number, end: number): string {
    return HTMLTemplateErrorStaticCreateMessage(message, template, start, end);
  }

  static fromElement(message: string, node: Element, rootNode: Element): HTMLTemplateError {
    return HTMLTemplateErrorStaticFromElement(this, message, node, rootNode);
  }

  static fromAttribute(message: string, attribute: Attr, rootNode: Element): HTMLTemplateError {
    return HTMLTemplateErrorStaticFromAttribute(this, message, attribute, rootNode);
  }

  constructor(message: string, template: string, start: number, end: number) {
    super(HTMLTemplateErrorStaticCreateMessage(message, template, start, end));
  }
}


export function testHTMLTemplateError() {
  const template = `
    <!--abc-->
    <div class="a">a_in_text</div>
    a_text
    <div class="b">
      <div class="b_in" onclick="console.log('click')">
        b_in_text
      </div>
    </div>
    b_text
    <div class="c">c_in_text</div>
  `;

  document.body.innerHTML = template;
  console.log(document.body.innerHTML);

  const element: Element = document.querySelector('.b_in') as Element;
  const attribute: Attr = element.getAttributeNode('onclick') as Attr;

  // const range: [number, number] = GetCharacterRangeOfNode(element, document.body);
  // console.log(range);
  // console.log(new HTMLTemplateError('missing attribute', document.body.innerHTML, ...range));
  // console.log(HTMLTemplateError.fromElement('missing attribute', element, document.body));
  console.error(HTMLTemplateError.fromAttribute('missing attribute', attribute, document.body));
}
