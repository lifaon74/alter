import { VirtualNodeList } from '../collections/VirtualNodeList';
import { VirtualHTMLCollection } from '../collections/VirtualHTMLCollection';
import { INodeStateObservable } from '../node-state-observable/interfaces';
import {
  ForEachNodeStateObservablesOfNodeTree, NodeStateObservable, NodeStateObservableOnMutationDisconnect
} from '../node-state-observable/implementation';
import {
  ChildNodesIterator, ChildNodesIteratorReversed, ClearChildNodes, IterableQuerySelector, NodeIsTextNode,
  PickElementsFromIterator
} from '../helpers/NodeHelpers';
import { IContainerNode } from './interfaces';
import { ReferenceNodeStaticNextSibling } from '../reference-node/implementation';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import {
  DestroyChildNodes, DestroyNodeSafe, DetachChildNodes, DetachNodeSafe
} from '../node-state-observable/mutations';
import { IsValidXMLName } from '../../tokenizers/xml';
import { uuid } from '../../../misc/helpers/uuid';
import { ENVIRONMENT } from '../../../environment';


/** PRIVATES **/

export const CONTAINER_NODE_PRIVATE = Symbol('container-node-private');

export interface IContainerNodePrivate {
  fragment: DocumentFragment
  startNode: Text | Comment;
  endNode: Text | Comment;
  childNodes: VirtualNodeList<ChildNode>;
  children: VirtualHTMLCollection<Element>;
  stateObservable: INodeStateObservable;
}

export interface IContainerNodeInternal extends IContainerNode {
  [CONTAINER_NODE_PRIVATE]: IContainerNodePrivate;
}

/** CONSTRUCTOR **/

export function ConstructContainerNode(
  instance: IContainerNode,
  transparent: boolean = ENVIRONMENT.production
): void {
  ConstructClassWithPrivateMembers(instance, CONTAINER_NODE_PRIVATE);
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];

  const doc: Document | null = instance.ownerDocument;
  if (doc === null) {
    throw new Error(`Expected ContainerNode having an ownerDocument`);
  } else {
    privates.fragment = doc.createDocumentFragment();
    privates.startNode = transparent ? doc.createTextNode('') : doc.createComment('START');
    // privates.startNode = transparent ? new TextReferenceNode(instance) : new CommentReferenceNode(instance, 'START');
    privates.endNode = transparent ? doc.createTextNode('') : doc.createComment('END');

    privates.childNodes = new VirtualNodeList<ChildNode>(() => Array.from(ContainerNodeChildNodesIterator(instance)));
    privates.children = new VirtualHTMLCollection<Element>(() => Array.from(ContainerNodeChildElementsIterator(instance)));

    privates.stateObservable = new NodeStateObservable(instance);

    privates.stateObservable
      .on('afterAttach', () => {
        // console.log('afterAttach');
        if (instance.parentNode) {
          privates.fragment.insertBefore(privates.startNode, privates.fragment.firstChild); // push startNode as first child of fragment
          privates.fragment.appendChild(privates.endNode);
          instance.parentNode.insertBefore(privates.fragment, ReferenceNodeStaticNextSibling(instance)); // fragment becomes empty
        } else {
          throw new Error(`Expected ContainerNode having a parent when receiving an 'afterAttach' event`);
        }
      })
      .on('afterDetach', () => {
        // console.log('afterDetach');
        let node: Node | null = privates.startNode.nextSibling;
        while ((node !== null) && (node !== privates.endNode)) {
          privates.fragment.appendChild(node);
          node = privates.startNode.nextSibling;
        }
        if (privates.startNode.parentNode !== null) {
          privates.startNode.parentNode.removeChild(privates.startNode);
        }
        if (privates.endNode.parentNode !== null) {
          privates.endNode.parentNode.removeChild(privates.endNode);
        }
      });
  }
}


// export function ContainerNodeIsDetached(instance: IContainerNode): boolean {
//   return (instance.parentNode === null)
//     || (instance.nextSibling !== (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].startNode)
//     || ((instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].endNode.parentNode !== instance.parentNode);
// }

/** FUNCTIONS **/

export function ContainerNodeIsDetached(instance: IContainerNode): boolean {
  return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].startNode.parentNode === null;
}



/** ContainerNodeChildNodesIterator **/

/**
 * Iterates over the list of child nodes of a ContainerNode when it is attached to the DOM
 */
export function * ContainerNodeChildNodesIteratorAttached(instance: IContainerNode): Generator<ChildNode, void, void> {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  let node: Node | null = privates.startNode.nextSibling;
  while ((node !== null) && (node !== privates.endNode)) {
    yield node as ChildNode;
    node = node.nextSibling;
  }
}

/**
 * Iterates over the list of child nodes of a ContainerNode when it is detached from the DOM
 */
export function ContainerNodeChildNodesIteratorDetached(instance: IContainerNode): Generator<ChildNode, void, void> {
  return ChildNodesIterator((instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment);
}

/**
 * Creates an iterator over a list composed of the child nodes of 'instance' of type ContainerNode, in asc order
 */
export function ContainerNodeChildNodesIterator(instance: IContainerNode): Generator<ChildNode, void, void> {
  return (instance.parentNode === null)
    ? ContainerNodeChildNodesIteratorDetached(instance)
    : ContainerNodeChildNodesIteratorAttached(instance);
}


/** ContainerNodeChildNodesIteratorReversed **/

export function * ContainerNodeChildNodesIteratorAttachedReversed(instance: IContainerNode): Generator<ChildNode, void, void> {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  let node: Node | null = privates.endNode.previousSibling;
  while ((node !== null) && (node !== privates.startNode)) {
    yield node as ChildNode;
    node = node.previousSibling;
  }
}

export function ContainerNodeChildNodesIteratorDetachedReversed(instance: IContainerNode): Generator<ChildNode, void, void> {
  return ChildNodesIteratorReversed((instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment);
}

/**
 * Creates an iterator over a list composed of the child nodes of 'paren' of type ContainerNode, in desc order
 */
export function ContainerNodeChildNodesIteratorReversed(instance: IContainerNode): Generator<ChildNode, void, void> {
  return (instance.parentNode === null)
    ? ContainerNodeChildNodesIteratorDetachedReversed(instance)
    : ContainerNodeChildNodesIteratorAttachedReversed(instance);
}


/** ContainerNodeChildElementsIterator **/

export function ContainerNodeChildElementsIterator(instance: IContainerNode): Generator<Element, void, void> {
  return PickElementsFromIterator(ContainerNodeChildNodesIterator(instance));
}

export function ContainerNodeChildElementsIteratorReversed(instance: IContainerNode): Generator<Element, void, void> {
  return PickElementsFromIterator(ContainerNodeChildNodesIteratorReversed(instance));
}

/** ContainerNodeIterableQuerySelector **/

export function * ContainerNodeIterableQuerySelectorAttached<E extends Element>(instance: IContainerNode, selectors: string): Generator<E, void, void> {
  const children: Node[] = Array.from(ContainerNodeChildNodesIteratorAttached(instance));
  const iterator: Generator<E, void, void> = IterableQuerySelector<E>((instance as any).parentElement, selectors);
  let result: IteratorResult<E>;
  while (!(result = iterator.next()).done) {
    for (let i = 0, l = children.length; i < l; i++) {
      if (children[i].contains(result.value)) {
        yield result.value;
      }
    }
  }
}

export function ContainerNodeIterableQuerySelectorDetached<E extends Element>(instance: IContainerNode, selectors: string): Generator<E, void, void> {
  return IterableQuerySelector((instance as any)._fragment as DocumentFragment, selectors);
}

/**
 * Creates an iterator over a list composed of the nodes matching 'selectors'
 */
export function ContainerNodeIterableQuerySelector<E extends Element>(instance: IContainerNode, selectors: string): Generator<E, void, void> {
  return ContainerNodeIsDetached(instance)
    ? ContainerNodeIterableQuerySelectorDetached(instance, selectors)
    : ContainerNodeIterableQuerySelectorAttached(instance, selectors);
}


export function ContainerNodeDestroyChildNodes(instance: IContainerNode): void {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    DestroyChildNodes(privates.fragment);
  } else {
    let node: Node | null;
    while (((node = privates.startNode.nextSibling) !== null) && (node !== privates.endNode)) {
      DestroyNodeSafe(node);
    }
  }
}

export function ContainerNodeDetachChildNodes(instance: IContainerNode): void {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    DetachChildNodes(privates.fragment);
  } else {
    let node: Node | null;
    while (((node = privates.startNode.nextSibling) !== null) && (node !== privates.endNode)) {
      DetachNodeSafe(node);
    }
  }
}

export function ContainerNodeClearChildNodes(instance: IContainerNode): void {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    ClearChildNodes(privates.fragment);
  } else {
    let node: Node | null;
    while (((node = privates.startNode.nextSibling) !== null) && (node !== privates.endNode)) {
      (instance.parentNode as Node).removeChild(node);
    }
  }
}

/** METHODS **/

/** Node - DONE **/

export function ContainerNodeGetTextContent(instance: IContainerNode): string | null {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.textContent;
  } else {
    let text: string = '';
    const iterator: Generator<Node, void, void> = ContainerNodeChildNodesIterator(instance);
    let result: IteratorResult<Node>;
    while (!(result = iterator.next()).done) {
      switch (result.value.nodeType) {
        case Node.TEXT_NODE:
        case Node.ELEMENT_NODE:
          text += result.value.textContent;
          break;
      }
    }
    return text;
  }
}

export function ContainerNodeSetTextContent(instance: IContainerNode, value: string | null): void {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    privates.fragment.textContent = value;
  } else {
    ContainerNodeClearChildNodes(instance);
    if (value !== null) {
      (instance.parentNode as Node).insertBefore(
        (instance.ownerDocument as Document).createTextNode(value),
        privates.endNode
      );
    }
  }
}

export function ContainerNodeGetChildNodes(instance: IContainerNode): NodeListOf<ChildNode> {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.childNodes;
  } else {
    return privates.childNodes.update();
  }
}

export function ContainerNodeGetFirstChild(instance: IContainerNode): ChildNode | null {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.firstChild;
  } else {
    const node: Node | null = privates.startNode.nextSibling;
    return ((node === null) || (node === privates.endNode))
      ? null
      : (node as ChildNode);
  }
}

export function ContainerNodeGetLastChild(instance: IContainerNode): ChildNode | null {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.lastChild;
  } else {
    const node: Node | null = privates.endNode.previousSibling;
    return ((node === null) || (node === instance))
      ? null
      : (node as ChildNode);
  }
}


export function ContainerNodeAppendChild<T extends Node>(instance: IContainerNode, newChild: T): T {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.appendChild<T>(newChild);
  } else {
    return (instance.parentNode as Node).insertBefore<T>(newChild, privates.endNode);
  }
}

export function ContainerNodeRemoveChild<T extends Node>(instance: IContainerNode, oldChild: T): T {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.removeChild<T>(oldChild);
  } else {
    return (instance.parentNode as Node).removeChild<T>(oldChild);
  }
}

export function ContainerNodeReplaceChild<T extends Node>(instance: IContainerNode, newChild: Node, oldChild: T): T {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.replaceChild<T>(newChild, oldChild);
  } else {
    return (instance.parentNode as Node).replaceChild<T>(newChild, oldChild);
  }
}

export function ContainerNodeInsertBefore<T extends Node>(instance: IContainerNode, newChild: T, refChild: Node | null): T {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.insertBefore<T>(newChild, refChild);
  } else {
    return (instance.parentNode as Node).insertBefore<T>(
      newChild,
      (refChild === null) ? privates.endNode : refChild
    );
  }
}

export function ContainerNodeCloneNode(instance: IContainerNode, deep: boolean = false): IContainerNode {
  const container: IContainerNode = new ContainerNode(instance.data);
  const _container: DocumentFragment = new DocumentFragment();
  const iterator: Generator<Node, void, void> = ContainerNodeChildNodesIterator(instance);
  let result: IteratorResult<Node>;
  while (!(result = iterator.next()).done) {
    _container.appendChild(result.value.cloneNode(deep));
  }
  container.appendChild(_container);
  return container;
}


export function ContainerNodeHasChildNodes(instance: IContainerNode): boolean {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.hasChildNodes();
  } else {
    const node: Node | null = privates.startNode.nextSibling;
    return (node !== null) && (node !== privates.endNode);
  }
}

export function ContainerNodeContains(instance: IContainerNode, child: Node): boolean {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.contains(child);
  } else {
    const iterator: Generator<Node, void, void> = ContainerNodeChildNodesIterator(instance);
    let result: IteratorResult<Node>;
    while (!(result = iterator.next()).done) {
      if (result.value === child) {
        return true;
      }
    }
    return false;
  }
}


// TODO https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
export function ContainerNodeCompareDocumentPosition(instance: IContainerNode, other: Node): number {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.compareDocumentPosition(other);
  } else {
    // invalid
    return Comment.prototype.compareDocumentPosition.call(instance, other);
  }
}


export function ContainerNodeIsDefaultNamespace(instance: IContainerNode, namespace: string | null): boolean {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.isDefaultNamespace(namespace);
  } else {
    return Comment.prototype.isDefaultNamespace.call(instance, namespace);
  }
}

export function ContainerNodeLookupNamespaceURI(instance: IContainerNode, namespace: string | null): string | null {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.lookupNamespaceURI(namespace);
  } else {
    return Comment.prototype.lookupNamespaceURI.call(instance, namespace);
  }
}

export function ContainerNodeLookupPrefix(instance: IContainerNode, prefix: string | null): string | null {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.lookupPrefix(prefix);
  } else {
    return Comment.prototype.lookupPrefix.call(instance, prefix);
  }
}


export function ContainerNodeNormalize(instance: IContainerNode): void {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.normalize();
  } else {
    const iterator: Generator<Node, void, void> = ContainerNodeChildNodesIterator(instance);
    let result: IteratorResult<Node>;
    while (!(result = iterator.next()).done) {
      if (NodeIsTextNode(result.value)) {
        const textNodes: Text[] = [result.value as Text];
        while ((!(result = iterator.next()).done) && NodeIsTextNode(result.value)) {
          textNodes.push(result.value as Text);
        }
        const length: number = textNodes.length;
        if (length > 1) {
          let text: string = textNodes[0].data;
          for (let i = 1; i < length; i++) {
            text += textNodes[i].data;
            (instance.parentNode as Node).removeChild(textNodes[i]);
          }
          textNodes[0].data = text;
        }
      }
    }
  }
}


/** ParentNode - DONE **/

export function ContainerNodeGetChildren(instance: IContainerNode): HTMLCollection {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.children;
  } else {
    return privates.children.update();
  }
}

export function ContainerNodeGetFirstElementChild(instance: IContainerNode): Element | null {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.firstElementChild;
  } else {
    const result: IteratorResult<Element> = ContainerNodeChildElementsIterator(instance).next();
    return result.done ? null : result.value;
  }
}

export function ContainerNodeGetLastElementChild(instance: IContainerNode): Element | null {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.lastElementChild;
  } else {
    const result: IteratorResult<Element> = ContainerNodeChildElementsIteratorReversed(instance).next();
    return result.done ? null : result.value;
  }
}

export function ContainerNodeGetChildElementCount(instance: IContainerNode): number {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.childElementCount;
  } else {
    const iterator: Generator<Element, void, void> = ContainerNodeChildElementsIterator(instance);
    let result: IteratorResult<Element>;
    let count: number = 0;
    while (!(result = iterator.next()).done) {
      count++;
    }
    return count;
  }
}


export function ContainerNodeAppend(instance: IContainerNode, nodes: (Node | string)[]): void {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.append(...nodes);
  } else {
    return privates.endNode.before(...nodes);
  }
}

export function ContainerNodePrepend(instance: IContainerNode, nodes: (Node | string)[]): void {
  const privates: IContainerNodePrivate = (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE];
  if (ContainerNodeIsDetached(instance)) {
    return privates.fragment.prepend(...nodes);
  } else {
    return privates.startNode.after(...nodes);
  }
}

export function ContainerNodeQuerySelector<E extends Element = Element>(instance: IContainerNode, selectors: string): E | null {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.querySelector<E>(selectors);
  } else {
    const result: IteratorResult<E> = ContainerNodeIterableQuerySelector<E>(instance, selectors).next();
    return result.done ? null : result.value;
  }
}

export function ContainerNodeQuerySelectorAll<E extends Element = Element>(instance: IContainerNode, selectors: string): NodeListOf<E> {
  if (ContainerNodeIsDetached(instance)) {
    return (instance as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].fragment.querySelectorAll<E>(selectors);
  } else {
    return new VirtualNodeList<E>(() => Array.from(ContainerNodeIterableQuerySelector<E>(instance, selectors))).update();
  }
}


/** Element **/

export function ContainerNodeGetInnerHTML(instance: IContainerNode): string {
  let html: string = '';
  const iterator: Generator<Node, void, void> = ContainerNodeChildNodesIterator(instance);
  let result: IteratorResult<Node>;
  while (!(result = iterator.next()).done) {
    const node: Node = result.value;
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        html += (node as Text).data;
        break;
      case Node.COMMENT_NODE:
        html += '<!--' + (node as Comment).data + '-->';
        break;
      case Node.ELEMENT_NODE:
        html += (node as Element).innerHTML;
        break;
    }
  }
  return html;
}

export function ContainerNodeSetInnerHTML(instance: IContainerNode, html: string) {
  const container: HTMLDivElement = (instance.ownerDocument as Document).createElement('div');
  container.innerHTML = html;
  ContainerNodeClearChildNodes(instance);

  let node: Node | null = container.firstChild;
  let nextNode: Node | null;
  while (node !== null) {
    nextNode = node.nextSibling;
    instance.appendChild(node);
    node = nextNode;
  }
}


export function ContainerNodeGetElementsByClassName(instance: IContainerNode, classNames: string): HTMLCollectionOf<Element> {
  const selector: string = classNames
    .split(' ')
    .map((name: string) => '.' + name)
    .join('');
  return new VirtualHTMLCollection(() => instance.querySelectorAll(selector));
}

export function ContainerNodeGetElementsByTagName(instance: IContainerNode, tagName: string): HTMLCollectionOf<Element> {
  return new VirtualHTMLCollection(
    IsValidXMLName(tagName)
      ? () => instance.querySelectorAll(tagName)
      : () => []
  );
}

export function ContainerNodeGetElementById(instance: IContainerNode, elementId: string): Element | null {
  return instance.querySelector(`#${ elementId }`);
}

export function ContainerNodeClosest(instance: IContainerNode, selector: string): Element | null {
  if (ContainerNodeIsDetached(instance)) {
    return null;
  } else {
    return (instance.parentElement as Element).closest(selector);
  }
}

/** CLASS **/

export class ContainerNode extends Comment implements IContainerNode {
  static readonly CONTAINER_NODE = 100;

  constructor(name: string = `CONTAINER-NODE:${ uuid() }`, transparent?: boolean) {
    super(name);
    ConstructContainerNode(this, transparent);
  }


  /** EventTarget - DONE **/

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
    throw new Error(`Cannot add an event listener on a ContainerNode`);
  }

  dispatchEvent(event: Event): boolean {
    throw new Error(`Cannot dispatch an event on a ContainerNode`);
  }

  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
    throw new Error(`Cannot remove an event listener on a ContainerNode`);
  }


  /** Node - DONE **/

  get nodeName(): string {
    return 'CONTAINER';
  }

  get nodeType(): number {
    return ContainerNode.CONTAINER_NODE;
  }

  get nodeValue(): string | null {
    return null;
  }


  get textContent(): string | null {
    return ContainerNodeGetTextContent(this);
  }

  set textContent(value: string | null) {
    ContainerNodeSetTextContent(this, value);
  }

  get childNodes(): NodeListOf<ChildNode> {
    return ContainerNodeGetChildNodes(this);
  }

  get firstChild(): ChildNode | null {
    return ContainerNodeGetFirstChild(this);
  }

  get lastChild(): ChildNode | null {
    return ContainerNodeGetLastChild(this);
  }


  get nextVirtualSibling(): Node | null {
    return ((this as unknown) as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].endNode.nextSibling;
  }


  appendChild<T extends Node>(newChild: T): T {
    return ContainerNodeAppendChild<T>(this, newChild);
  }

  removeChild<T extends Node>(oldChild: T): T {
    return ContainerNodeRemoveChild<T>(this, oldChild);
  }

  replaceChild<T extends Node>(newChild: Node, oldChild: T): T {
    return ContainerNodeReplaceChild<T>(this, newChild, oldChild);
  }

  insertBefore<T extends Node>(newChild: T, refChild: Node | null): T {
    return ContainerNodeInsertBefore<T>(this, newChild, refChild);
  }

  cloneNode(deep: boolean = false): IContainerNode {
    return ContainerNodeCloneNode(this, deep);
  }


  getRootNode(options?: GetRootNodeOptions): Node {
    if (this.parentNode === null) {
      return this;
    } else {
      return super.getRootNode(options);
    }
  }

  hasChildNodes(): boolean {
    return ContainerNodeHasChildNodes(this);
  }

  contains(child: Node): boolean {
    return ContainerNodeContains(this, child);
  }


  isEqualNode(otherNode: Node | null): boolean {
    return (otherNode instanceof ContainerNode)
      && (this.innerHTML === (otherNode as IContainerNode).innerHTML);
  }

  isSameNode(otherNode: Node | null): boolean {
    return otherNode === this;
  }


  compareDocumentPosition(other: Node): number {
    return ContainerNodeCompareDocumentPosition(this, other);
  }


  isDefaultNamespace(namespace: string | null): boolean {
    return ContainerNodeIsDefaultNamespace(this, namespace);
  }

  lookupNamespaceURI(namespace: string | null): string | null {
    return ContainerNodeLookupNamespaceURI(this, namespace);
  }

  lookupPrefix(prefix: string | null): string | null {
    return ContainerNodeLookupPrefix(this, prefix);
  }


  normalize(): void {
    return ContainerNodeNormalize(this);
  }


  /** ParentNode - DONE **/

  get children(): HTMLCollection {
    return ContainerNodeGetChildren(this);
  }

  get firstElementChild(): Element | null {
    return ContainerNodeGetFirstElementChild(this);
  }

  get lastElementChild(): Element | null {
    return ContainerNodeGetLastElementChild(this);
  }

  get childElementCount(): number {
    return ContainerNodeGetChildElementCount(this);
  }


  append(...nodes: (Node | string)[]): void {
    return ContainerNodeAppend(this, nodes);
  }

  prepend(...nodes: (Node | string)[]): void {
    return ContainerNodePrepend(this, nodes);
  }

  querySelector<E extends Element = Element>(selectors: string): E | null {
    return ContainerNodeQuerySelector<E>(this, selectors);
  }

  querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E> {
    return ContainerNodeQuerySelectorAll<E>(this, selectors);
  }


  /** ChildNode - DONE **/

  after(...nodes: (Node | string)[]): void {
    ((this as unknown) as IContainerNodeInternal)[CONTAINER_NODE_PRIVATE].endNode.after(...nodes);
  };

  // ... others are OK with inherit of Comment


  /** Element **/

  get innerHTML(): string {
    return ContainerNodeGetInnerHTML(this);
  }

  set innerHTML(html: string) {
    ContainerNodeSetInnerHTML(this, html);
  }


  getElementsByClassName(classNames: string): HTMLCollectionOf<Element> {
    return ContainerNodeGetElementsByClassName(this, classNames);
  }

  getElementsByTagName(tagName: string): HTMLCollectionOf<Element> {
    return ContainerNodeGetElementsByTagName(this, tagName);
  }

  getElementById(elementId: string): Element | null {
    return ContainerNodeGetElementById(this, elementId);
  }

  closest(selector: string): Element | null {
    return ContainerNodeClosest(this, selector);
  }

}
