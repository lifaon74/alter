import { CreateDocumentFragmentFromNodes } from '../helpers/NodeHelpers';
import { DOMState} from './mutations';
import { AttachNode, DetachNode, GetNodeDOMState } from './mutations';

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
        throw new Error(`Cannot attach a node in state: ${state}`);
    }
  };
  // for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(_appendChild))) {
  //   console.log(key);
  // }
  Node.prototype.appendChild.toString = _appendChild.toString.bind(_appendChild);
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
        throw new Error(`Cannot attach a node in state: ${state}`);
    }
  };
  Node.prototype.removeChild.toString = _removeChild.toString.bind(_removeChild);
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
        throw new Error(`Cannot attach a node in state: ${oldChildState}`);
    }
  };
  Node.prototype.replaceChild.toString = _replaceChild.toString.bind(_replaceChild);
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
        throw new Error(`Cannot attach a node in state: ${state}`);
    }
  };
  Node.prototype.insertBefore.toString = _insertBefore.toString.bind(_insertBefore);
}

export function AddCustomNodeSupportForParentNodeAppend(_constructor: any): void {
  if (typeof _constructor.prototype.append === 'function') {
    const _append = _constructor.prototype.append;
    _constructor.prototype.append = function append(...nodes: (Node | string)[]): void {
      this.appendChild(CreateDocumentFragmentFromNodes(nodes));
    };
    _constructor.prototype.append.toString = _append.toString.bind(_append);
  } else {
    Object.defineProperty(_constructor.prototype, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append(...nodes: (Node | string)[]): void {
        this.appendChild(CreateDocumentFragmentFromNodes(nodes));
      }
    });
    _constructor.prototype.append.toString = function () {
      return `function append() { [native code] };`;
    };
  }
}

export function AddCustomNodeSupportForParentNodePrepend(_constructor: any): void {
  if (typeof _constructor.prototype.prepend === 'function') {
    const _prepend = _constructor.prototype.prepend;
    _constructor.prototype.prepend = function (...nodes: (Node | string)[]): void {
      this.insertBefore(CreateDocumentFragmentFromNodes(nodes), this.firstChild);
    };
    _constructor.prototype.prepend.toString = _prepend.toString.bind(_prepend);
  } else {
    Object.defineProperty(_constructor.prototype, 'prepend', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function prepend(...nodes: (Node | string)[]): void {
        this.insertBefore(CreateDocumentFragmentFromNodes(nodes), this.firstChild);
      }
    });
    _constructor.prototype.prepend.toString = function () {
      return `function prepend() { [native code] };`;
    };
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
    _constructor.prototype.after.toString = _after.toString.bind(_after);
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
    _constructor.prototype.after.toString = function () {
      return `function after() { [native code] };`;
    };
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
    _constructor.prototype.before.toString = _before.toString.bind(_before);
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
    _constructor.prototype.before.toString = function () {
      return `function before() { [native code] };`;
    };
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
    _constructor.prototype.replaceWith.toString = _replaceWith.toString.bind(_replaceWith);
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
    _constructor.prototype.replaceWith.toString = function () {
      return `function replaceWith() { [native code] };`;
    };
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
        throw new Error(`Cannot attach a node in state: ${state}`);
    }
  };
  Document.prototype.adoptNode.toString = _adoptNode.toString.bind(_adoptNode);
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

export function AddCustomNodeCompleteSupportForNode(): void {
  AddCustomNodeSupportForNode();
  AddCustomNodeSupportForParentNode();
  AddCustomNodeSupportForChildNode();
  AddCustomNodeSupportForDocumentAdoptNode();
}
