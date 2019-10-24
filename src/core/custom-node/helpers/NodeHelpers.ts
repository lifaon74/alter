import { EnumToString } from '../../../misc/helpers/EnumToString';
import { uuid } from '../../../misc/helpers/UUID';

export type HTMLElementConstructor = typeof HTMLElement;


export function IsNode(value: any): value is Node {
  return (value instanceof Node);
}


export function NodeIsTextNode(value: Node): value is Text {
  return (value.nodeType === Node.TEXT_NODE);
}

export function IsTextNode(value: any): value is Text {
  return IsNode(value) && NodeIsTextNode(value);
}

export function NodeIsElementNode(value: Node): value is Element {
  return (value.nodeType === Node.ELEMENT_NODE);
}

export function IsElementNode(value: any): value is Element {
  return IsNode(value) && NodeIsElementNode(value);
}


export function NodeIsDocumentNode(value: Node): value is Document {
  return (value.nodeType === Node.DOCUMENT_NODE);
}

export function IsDocumentNode(value: any): value is Document {
  return IsNode(value) && NodeIsDocumentNode(value);
}


export function NodeIsDocumentFragmentNode(value: Node): value is DocumentFragment {
  return (value.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
}

export function IsDocumentFragmentNode(value: any): value is DocumentFragment {
  return IsNode(value) && NodeIsDocumentFragmentNode(value);
}

/*----------*/


/**
 * Creates an iterator over a list composed of 'node' and its nextSiblings
 * @param node
 */
export function * NodeIterator(node: Node | null): Generator<Node, void, void> {
  while (node !== null) {
    yield node;
    node = node.nextSibling;
  }
}

/**
 * Creates an iterator over a list composed of 'node' and its previousSibling
 * @param node
 */
export function * NodeIteratorReversed(node: Node | null): Generator<Node, void, void> {
  while (node !== null) {
    yield node;
    node = node.previousSibling;
  }
}

/**
 * Creates an iterator over a list composed of the child nodes of 'parent', in asc order
 * @param parent
 */
export function ChildNodesIterator(parent: Node): Generator<ChildNode, void, void> {
  return NodeIterator(parent.firstChild) as Generator<ChildNode, void, void>;
}

/**
 * Creates an iterator over a list composed of the child nodes of 'parent', in desc order
 * @param parent
 */
export function ChildNodesIteratorReversed(parent: Node): Generator<ChildNode, void, void> {
  return NodeIterator(parent.lastChild) as Generator<ChildNode, void, void>;
}

/**
 * Returns an iterator retuning Element only, from a Node iterator.
 * @param iterator
 */
export function * PickElementsFromIterator(iterator: Iterator<Node>): Generator<Element, void, void> {
  let result: IteratorResult<Node>;
  while (!(result = iterator.next()).done) {
    if (IsElementNode(result.value)) {
      yield result.value;
    }
  }
}

const SCOPE_REGEXP = /((^|,)\s*):scope/g;

// Element, Document, DocumentFragment
export function * IterableQuerySelector<E extends Element>(parent: ParentNode & Node, selectors: string): Generator<E, void, void> {
  let filterFunction: (node: Element) => boolean;
  SCOPE_REGEXP.lastIndex = 0;

  // only if selectors contains :scope
  if (SCOPE_REGEXP.test(selectors)) {
    SCOPE_REGEXP.lastIndex = 0;

    if (IsElementNode(parent)) {
      const id: string = `id-${ uuid() }`;
      const noScopeSelectors: string = selectors.replace(SCOPE_REGEXP, `$1#${ id }`); // replace :scope with #ID
      filterFunction = (node: Element): boolean => {
        const elementId: string | null = parent.getAttribute('id'); // remember current element id
        parent.id = id; // set uuid
        const match: boolean = node.matches(noScopeSelectors);
        // restore previous id
        if (elementId === null) {
          parent.removeAttribute('id');
        } else {
          parent.setAttribute('id', elementId);
        }
        return match;
      };
    } else if (IsDocumentNode(parent)) {
      const noScopeSelectors: string = selectors.replace(SCOPE_REGEXP, '$1html'); // replace :scope with html
      filterFunction = (node: Element): boolean => {
        return node.matches(noScopeSelectors);
      };
    } else {
      throw new Error(`Unsupported element type with :scope`);
    }
  } else {
    filterFunction = (node: Element): boolean => {
      return node.matches(selectors);
    };
  }

  const treeWalker: TreeWalker = document.createTreeWalker(
    parent,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: Element) => {
        return filterFunction(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    },
    false
  );

  while (treeWalker.nextNode()) {
    yield treeWalker.currentNode as E;
  }
}

/**
 * Creates a DocumentFragment from a list of nodes.
 * @param nodes
 */
export function CreateDocumentFragmentFromNodes(nodes: (Node | string)[]): DocumentFragment {
  const documentFragment: DocumentFragment = document.createDocumentFragment();
  let node: Node | string;
  for (let i = 0, l = nodes.length; i < l; i++) {
    node = nodes[i];
    documentFragment.appendChild((node instanceof Node) ? node : document.createTextNode(String(node)));
  }
  return documentFragment;
}

export function ClearChildNodes(node: Node): void {
  while (node.firstChild !== null) {
    node.removeChild(node.firstChild);
  }
}


export type TElementAttributeType = 'boolean' | 'number' | 'string' | string[];

// TODO could improve type by returning TElementAttributeTypeMap<TElementAttributeType>
export function GetElementAttribute<T>(element: HTMLElement, name: string, type: TElementAttributeType = 'string', defaultValue?: boolean | number | string): T {
  const value: string | null = element.getAttribute(name);
  if ((value === null) && (defaultValue !== void 0)) {
    return defaultValue as any;
  } else {
    if (Array.isArray(type)) {
      return ((value !== null) && type.includes(value)) ? value : defaultValue as any;
    } else {
      switch (type) {
        case 'boolean':
          return ((value !== null) && (value !== 'false')) as any;
        case 'number':
          return Number(value) as any;
        case 'string':
          return value as any;
        default:
          throw new TypeError(`Expected 'boolean', 'number', 'string' or string[] as type`);
      }
    }
  }
}

export function SetElementAttribute(element: Element, name: string, value: any = '', type: TElementAttributeType = 'string'): void {
  if ((value === void 0) || (value === null)) {
    element.removeAttribute(name);
  } else {
    if (Array.isArray(type) && !type.includes(value)) {
      throw new TypeError(`Expected ${ EnumToString(type) } as ${ element.constructor.name }.${ name }`);
    }
    element.setAttribute(name, String(value));
  }
}


export function IsHTMLElementConstructor(target: any): boolean {
  while (target !== null) {
    if (target === HTMLElement) {
      return true;
    } else {
      target = Object.getPrototypeOf(target);
    }
  }
  return false;
}
