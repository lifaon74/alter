import { EnumToString } from '../../../helpers';

export type HTMLElementConstructor = typeof HTMLElement;

/**
 * Creates an iterator over a list composed of 'node' and its nextSiblings
 * @param node
 */
export function* NodeIterator(node: Node | null): IterableIterator<Node> {
  while (node !== null) {
    yield node;
    node = node.nextSibling;
  }
}

/**
 * Creates an iterator over a list composed of 'node' and its previousSibling
 * @param node
 */
export function* NodeIteratorReversed(node: Node | null): IterableIterator<Node> {
  while (node !== null) {
    yield node;
    node = node.previousSibling;
  }
}

/**
 * Creates an iterator over a list composed of the child nodes of 'parent', in asc order
 * @param parent
 */
export function ChildNodesIterator(parent: Node): IterableIterator<ChildNode> {
  return NodeIterator(parent.firstChild) as IterableIterator<ChildNode>;
}

/**
 * Creates an iterator over a list composed of the child nodes of 'parent', in desc order
 * @param parent
 */
export function ChildNodesIteratorReversed(parent: Node): IterableIterator<ChildNode> {
  return NodeIterator(parent.lastChild) as IterableIterator<ChildNode>;
}

/**
 * Returns an iterator retuning Element only, from a Node iterator.
 * @param iterator
 */
export function* PickElementsFromIterator(iterator: IterableIterator<Node>): IterableIterator<Element> {
  let result: IteratorResult<Node>;
  while (!(result = iterator.next()).done) {
    if (result.value.nodeType === Node.ELEMENT_NODE) {
      yield result.value as Element;
    }
  }
}

// Element, Document, DocumentFragment
export function* IterableQuerySelector<E extends Element>(parent: ParentNode & Node, selectors: string): IterableIterator<E> {
  let filterFunction: (node: Element) => boolean;

  // only if selectors contains :scope
  if (/(^|,)\s*:scope/.test(selectors)) {
    if (parent instanceof Element) {
      const uuid: string = 'ID_' + Date.now().toString(16) + '_' + Math.floor(Math.random() * 1e15).toString(16);
      const noScopeSelectors: string = selectors.replace(/((^|,)\s*):scope/g, '$1#' + uuid); // replace :scope with #ID
      filterFunction = (node: Element): boolean => {
        const id: string | null = parent.getAttribute('id'); // remember current element id
        parent.id = uuid; // set uuid
        const match: boolean = node.matches(noScopeSelectors);
        // restore previous id
        if (id === null) {
          parent.removeAttribute('id');
        } else {
          parent.setAttribute('id', id);
        }
        return match;
      };
    } else if (parent instanceof Document) {
      const noScopeSelectors: string = selectors.replace(/((^|,)\s*):scope/g, '$1html'); // replace :scope with html
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
    { acceptNode: (node: Element) => (filterFunction(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP) },
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

export function GetElementAttribute<T>(element: HTMLElement, name: string, type: TElementAttributeType = 'string', defaultValue?: boolean | number | string): T {
  const value: string | null = element.getAttribute(name);
  if ((value === null) && (defaultValue !== void 0)) {
    return defaultValue as any;
  } else {
    if (Array.isArray(type)) {
      return type.includes(value) ? value : defaultValue as any;
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
      throw new TypeError(`Expected ${EnumToString(type)} as ${element.constructor.name}.${name}`);
    }
    element.setAttribute(name, String(value));
  }
}


export function IsHTMLElementConstructor(target: any): boolean {
  let superClass: any = target;
  const objectPrototype: any = Object.getPrototypeOf(Object);
  while (superClass !== objectPrototype) {
    if (superClass === HTMLElement) {
      return true;
    } else {
      superClass = Object.getPrototypeOf(superClass);
    }
  }
  return false;
}
