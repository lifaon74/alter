import { CreateDocumentFragmentFromNodes } from '../helpers/NodeHelpers';
import { AttachNode, DetachNode, DOMState, GetNodeDOMState } from './mutations';

/**
 * These functions intercept calls on native functions which mutate the DOM, and use AttachNode and DetachNode instead.
 * This allows node's appending/removing from the DOM to be detected and modified (instead of the native functions),
 * while still using native functions.
 *
 * @Example:
 * document.body.appendChild(node) will use AttachNode under the hood
 */


export function AddCustomNodeSupportForNodeAppendChild(): void {
  const _appendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function appendChild<T extends Node>(newChild: T): T {
    const state: DOMState = GetNodeDOMState(newChild);
    switch (state) {
      case 'attached':
        DetachNode(newChild);
      // fallthrough
      case 'detached':
        return AttachNode(newChild, this, null);
      case 'attaching':
        return _appendChild.call(this, newChild);
      default:
        throw new Error(`Cannot attach a node in state: ${ state }`);
    }
  };
  // for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(_appendChild))) {
  //   console.log(key);
  // }
  AssignToStringFunction(Node.prototype, 'appendChild', _appendChild);
}

export function AddCustomNodeSupportForNodeRemoveChild(): void {
  const _removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(oldChild: T): T {
    const state: DOMState = GetNodeDOMState(oldChild);
    switch (state) {
      case 'attached':
        return DetachNode(oldChild);
      case 'detached':
      case 'detaching':
        return _removeChild.call(this, oldChild);
      default:
        throw new Error(`Cannot attach a node in state: ${ state }`);
    }
  };
  AssignToStringFunction(Node.prototype, 'removeChild', _removeChild);
}

export function AddCustomNodeSupportForNodeReplaceChild(): void {
  const _replaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function replaceChild<T extends Node>(newChild: Node, oldChild: T): T {
    const oldChildState: DOMState = GetNodeDOMState(oldChild);
    switch (oldChildState) {
      case 'attached':
        this.insertBefore(newChild, oldChild);
        return DetachNode(oldChild);
      case 'detached':
      case 'detaching':
        return _replaceChild.call(this, newChild, oldChild);
      default:
        throw new Error(`Cannot attach a node in state: ${ oldChildState }`);
    }
  };
  AssignToStringFunction(Node.prototype, 'replaceChild', _replaceChild);
}

export function AddCustomNodeSupportForNodeInsertBefore(): void {
  const _insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(newChild: T, refChild: Node | null): T {
    const state: DOMState = GetNodeDOMState(newChild);
    switch (state) {
      case 'attached':
        DetachNode(newChild);
      // fallthrough
      case 'detached':
        return AttachNode(newChild, this, refChild);
      case 'attaching':
        return _insertBefore.call(this, newChild, refChild);
      default:
        throw new Error(`Cannot attach a node in state: ${ state }`);
    }
  };
  AssignToStringFunction(Node.prototype, 'insertBefore', _insertBefore);
}

export function AddCustomNodeSupportForParentNodeAppend(_constructor: any): void {
  if (typeof _constructor.prototype.append === 'function') {
    const _append = _constructor.prototype.append;
    _constructor.prototype.append = function append(...nodes: (Node | string)[]): void {
      this.appendChild(CreateDocumentFragmentFromNodes(nodes));
    };
    AssignToStringFunction(_constructor.prototype, 'append', _append);
  } else {
    Object.defineProperty(_constructor.prototype, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append(...nodes: (Node | string)[]): void {
        this.appendChild(CreateDocumentFragmentFromNodes(nodes));
      }
    });
    AssignToStringFunction(_constructor.prototype, 'append');
  }
}

export function AddCustomNodeSupportForParentNodePrepend(_constructor: any): void {
  if (typeof _constructor.prototype.prepend === 'function') {
    const _prepend = _constructor.prototype.prepend;
    _constructor.prototype.prepend = function (...nodes: (Node | string)[]): void {
      this.insertBefore(CreateDocumentFragmentFromNodes(nodes), this.firstChild);
    };
    AssignToStringFunction(_constructor.prototype, 'prepend', _prepend);
  } else {
    Object.defineProperty(_constructor.prototype, 'prepend', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function prepend(...nodes: (Node | string)[]): void {
        this.insertBefore(CreateDocumentFragmentFromNodes(nodes), this.firstChild);
      }
    });
    AssignToStringFunction(_constructor.prototype, 'prepend');
  }
}

export function AddCustomNodeSupportForChildNodeAfter(_constructor: any): void {
  if (typeof _constructor.prototype.after === 'function') {
    const _after = _constructor.prototype.after;
    _constructor.prototype.after = function after(...nodes: (Node | string)[]): void {
      if (this.parentNode === null) {
        return _after.apply(this, nodes);
      } else {
        this.parentNode.insertBefore(CreateDocumentFragmentFromNodes(nodes), this.nextSibling);
      }
    };
    AssignToStringFunction(_constructor.prototype, 'after', _after);
  } else {
    Object.defineProperty(_constructor.prototype, 'after', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function after(...nodes: (Node | string)[]): void {
        if (this.parentNode !== null) {
          this.parentNode.insertBefore(CreateDocumentFragmentFromNodes(nodes), this.nextSibling);
        }
      }
    });
    AssignToStringFunction(_constructor.prototype, 'after');
  }
}

export function AddCustomNodeSupportForChildNodeBefore(_constructor: any): void {
  if (typeof _constructor.prototype.before === 'function') {
    const _before = _constructor.prototype.before;
    _constructor.prototype.before = function before(...nodes: (Node | string)[]): void {
      if (this.parentNode === null) {
        return _before.apply(this, nodes);
      } else {
        this.parentNode.insertBefore(CreateDocumentFragmentFromNodes(nodes), this);
      }
    };
    AssignToStringFunction(_constructor.prototype, 'before', _before);
  } else {
    Object.defineProperty(_constructor.prototype, 'before', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function before(...nodes: (Node | string)[]): void {
        if (this.parentNode !== null) {
          this.parentNode.insertBefore(CreateDocumentFragmentFromNodes(nodes), this);
        }
      }
    });
    AssignToStringFunction(_constructor.prototype, 'before');
  }
}

export function AddCustomNodeSupportForChildNodeReplaceWith(_constructor: any): void {
  if (typeof _constructor.prototype.replaceWith === 'function') {
    const _replaceWith = _constructor.prototype.replaceWith;
    _constructor.prototype.replaceWith = function replaceWith(...nodes: (Node | string)[]): void {
      if (this.parentNode === null) {
        return replaceWith.apply(this, nodes);
      } else {
        this.parentNode.replaceChild(CreateDocumentFragmentFromNodes(nodes), this);
      }
    };
    AssignToStringFunction(_constructor.prototype, 'replaceWith', _replaceWith);
  } else {
    Object.defineProperty(_constructor.prototype, 'replaceWith', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function replaceWith(...nodes: (Node | string)[]): void {
        if (this.parentNode !== null) {
          this.parentNode.replaceChild(CreateDocumentFragmentFromNodes(nodes), this);
        }
      }
    });
    AssignToStringFunction(_constructor.prototype, 'replaceWith');
  }
}

export function AddCustomNodeSupportForDocumentAdoptNode(): void {
  const _adoptNode = Document.prototype.adoptNode;
  Document.prototype.adoptNode = function adoptNode<T extends Node>(source: T): T {
    const state: DOMState = GetNodeDOMState(source);
    switch (state) {
      case 'attached':
        DetachNode(source);
      // fallthrough
      case 'detached':
      case 'detaching':
        return _adoptNode.call(this, source);
      default:
        throw new Error(`Cannot attach a node in state: ${ state }`);
    }
  };
  AssignToStringFunction(Document.prototype, 'adoptNode', _adoptNode);
}

function AssignToStringFunction(proto: object, name: string, nativeFunction?: (...args: any[]) => any): void {
  proto[name] = CreateToStringFunction(name,  nativeFunction);
}

function CreateToStringFunction(name: string, nativeFunction?: (...args: any[]) => any): () => string {
  return (typeof nativeFunction === 'function')
    ? nativeFunction.toString.bind(nativeFunction)
    : function () {
      return `function ${ name }() { [native code] };`;
    };
}

export function AddCustomNodeSupportForNode(): void {
  AddCustomNodeSupportForNodeAppendChild();
  AddCustomNodeSupportForNodeRemoveChild();
  AddCustomNodeSupportForNodeReplaceChild();
  AddCustomNodeSupportForNodeInsertBefore();
}

export function AddCustomNodeSupportForParentNode(): void {
  [Element, Document, DocumentFragment].forEach((_constructor: any) => {
    AddCustomNodeSupportForParentNodeAppend(_constructor);
    AddCustomNodeSupportForParentNodePrepend(_constructor);
  });
}

export function AddCustomNodeSupportForChildNode(): void {
  [Element, CharacterData, DocumentType].forEach((_constructor: any) => {
    AddCustomNodeSupportForChildNodeAfter(_constructor);
    AddCustomNodeSupportForChildNodeBefore(_constructor);
    AddCustomNodeSupportForChildNodeReplaceWith(_constructor);
  });
}

/**
 * INFO may consider interceptor for innerHTML and innerText too
 */
export function AddCustomNodeCompleteSupportForNode(): void {
  AddCustomNodeSupportForNode();
  AddCustomNodeSupportForParentNode();
  AddCustomNodeSupportForChildNode();
  AddCustomNodeSupportForDocumentAdoptNode();
}
