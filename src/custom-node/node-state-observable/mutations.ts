import { IPreventable, Preventable } from '@lifaon/observables';
import {
  ForEachNodeStateObservablesOfNode,
  ForEachNodeStateObservablesOfNodeTree, NodeStateObservableOnMutationAfterAttach,
  NodeStateObservableOnMutationAfterDetach,
  NodeStateObservableOnMutationBeforeAttach, NodeStateObservableOnMutationBeforeDetach,
  NodeStateObservableOnMutationConnect, NodeStateObservableOnMutationDestroy,
  NodeStateObservableOnMutationDisconnect
} from './implementation';
import {
  INodeStateObservable, TNodeStateObservableBeforeAttachPreventableType, TNodeStateObservableBeforeDetachPreventableType
} from './interfaces';

/**
 * A node may be in one of the following state:
 *  - 'attached' => the node has a direct parent
 *  - 'attaching' => the node is attaching to a parent
 *  - 'detached' => the node has no direct parent
 *  - 'detaching' => the node has is detaching from its parent
 *  - 'destroyed' => the node is destroyed (will not re-enter into the DOM, so all linked resources may be removed)
 *  - 'destroying' => the node is destroying
 */
export type DOMState = 'attached' | 'attaching' | 'detached' | 'detaching' | 'destroying' | 'destroyed';

// map from a Node to a DOMState
const NodeDOMStateMap: WeakMap<Node, DOMState> = new WeakMap<Node, DOMState>();

/**
 * Returns the state of a Node
 * @param node
 */
export function GetNodeDOMState(node: Node): DOMState {
  let state: DOMState;
  const isDetached: boolean = (node.parentNode === null);
  if (NodeDOMStateMap.has(node)) {
    state = NodeDOMStateMap.get(node);
    if (
      (isDetached && (state === 'attached'))
      || (!isDetached && ((state === 'detached') || (state === 'destroyed')))
    ) {
      console.warn(`Incoherent state: found a node in state '${state}' ${isDetached ? 'without' : 'with'} a parent.`);
      state = (node.parentNode === null) ? 'detached' : 'attached';
      NodeDOMStateMap.set(node, state);
    }
  } else {
    state = isDetached ? 'detached' : 'attached';
    NodeDOMStateMap.set(node, state);
  }
  return state;
}




/**
 * Default function of what to do when a 'node' should be attached to a 'parent' before a 'refNode'.
 * @param node
 * @param parent
 * @param refNode
 */
export function ApplyAttach(node: Node, parent: Node, refNode: Node | null = null): void {
  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    const nodes: Node[] = Array.from(node.childNodes);
    parent.insertBefore(node, refNode);
    const length: number = nodes.length;
    if ((length > 0) && node.ownerDocument.contains(nodes[0])) {
      for (let i = 0; i < length; i++) {
        ForEachNodeStateObservablesOfNodeTree(nodes[i], NodeStateObservableOnMutationConnect);
      }
    }
  } else {
    parent.insertBefore(node, refNode);
    if (node.ownerDocument.contains(node)) {
      ForEachNodeStateObservablesOfNodeTree(node, NodeStateObservableOnMutationConnect);
    }
  }
}

/**
 * Attaches 'node' to 'parent' before 'refNode'.
 * A node may be attached only if it is in a 'detached' state
 * @param node
 * @param parent
 * @param refNode
 */
export function AttachNode<N extends Node>(node: N, parent: Node, refNode: Node | null = null): N {
  const parentState: DOMState = GetNodeDOMState(parent);
  if ((parentState === 'destroyed') || (parentState === 'destroying')) {
    throw new Error(`Cannot attach a node with a destroyed parent.`);
  } else {
    const state: DOMState = GetNodeDOMState(node);
    if (state === 'detached') {
      NodeDOMStateMap.set(node, 'attaching');
      const preventable: IPreventable<TNodeStateObservableBeforeAttachPreventableType> = new Preventable<TNodeStateObservableBeforeAttachPreventableType>();
      ForEachNodeStateObservablesOfNode(node, (observable: INodeStateObservable) => {
        NodeStateObservableOnMutationBeforeAttach(observable, preventable);
      });
      if (!preventable.isPrevented('attach')) {
        ApplyAttach(node, parent, refNode);
      }
      if (!preventable.isPrevented('afterAttach')) {
        ForEachNodeStateObservablesOfNode(node, NodeStateObservableOnMutationAfterAttach);
      }
      NodeDOMStateMap.set(node, 'attached');
      return node;
    } else {
      throw new Error(`Cannot attach a node in state: ${state}`);
    }
  }
}


/**
 * Default function of what to do when a 'node' should be detached from its parent.
 * @param node
 */
export function ApplyDetach(node: Node): void {
  node.parentNode.removeChild(node);
  ForEachNodeStateObservablesOfNodeTree(node, NodeStateObservableOnMutationDisconnect);
}

/**
 * Detaches 'node' from its parent.
 * A node may be detached only if it is in a 'attached' state
 * @param node
 */
export function DetachNode<N extends Node>(node: N): N {
  const state: DOMState = GetNodeDOMState(node);
  if (state === 'attached') {
    NodeDOMStateMap.set(node, 'detaching');
    const preventable: IPreventable<TNodeStateObservableBeforeDetachPreventableType> = new Preventable<TNodeStateObservableBeforeDetachPreventableType>();
    ForEachNodeStateObservablesOfNode(node, (observable: INodeStateObservable) => {
      NodeStateObservableOnMutationBeforeDetach(observable, preventable);
    });
    if (!preventable.isPrevented('detach')) {
      ApplyDetach(node);
    }
    if (!preventable.isPrevented('afterDetach')) {
      ForEachNodeStateObservablesOfNode(node, NodeStateObservableOnMutationAfterDetach);
    }
    NodeDOMStateMap.set(node, 'detached');
    return node;
  } else {
    throw new Error(`Cannot detach a node in state: ${state}`);
  }
}

/**
 * Default function of what to do when a 'node' should be destroyed.
 * @param node
 */
export function ApplyDestroy(node: Node): void {
  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    const nodes: ArrayLike<Node> = node.childNodes;
    for (let i = 0, length: number = nodes.length; i < length; i++) {
      ForEachNodeStateObservablesOfNodeTree(nodes[i], NodeStateObservableOnMutationDestroy);
    }
  } else {
    ForEachNodeStateObservablesOfNodeTree(node, NodeStateObservableOnMutationDestroy);
  }
}


/**
 * Destroy 'node' (clear eventual resources)
 * A node may be destroyed only if it is in a 'detached' state
 * @param node
 */
export function DestroyNode<N extends Node>(node: N): N {
  const state: DOMState = GetNodeDOMState(node);
  if (state === 'detached') {
    NodeDOMStateMap.set(node, 'destroying');
    ApplyDestroy(node);
    NodeDOMStateMap.set(node, 'destroyed');
    return node;
  } else {
    throw new Error(`Cannot destroy a node in state: ${state}`);
  }
}

/**
 * Attaches a node. If the node is already in an 'attached' state, detaches it first.
 * @param node
 * @param parent
 * @param refNode
 */
export function AttachNodeSafe<N extends Node>(node: N, parent: Node, refNode?: Node | null): N {
  const state: DOMState = GetNodeDOMState(node);
  if (state === 'attached') {
    DetachNode(node);
  }
  return AttachNode(node, parent, refNode);
}

/**
 * Destroyes a node. If the node is in an 'attached' state, detaches it first.
 * @param node
 */
export function DestroyNodeSafe<N extends Node>(node: N): N {
  const state: DOMState = GetNodeDOMState(node);
  if (state === 'attached') {
    DetachNode(node);
  }
  return DestroyNode(node);
}


export function DetachChildNodes(node: Node): void {
  while (node.firstChild !== null) {
    DetachNode(node.firstChild);
  }
}


export function DestroyChildNodes(node: Node): void {
  while (node.firstChild !== null) {
    DestroyNodeSafe(node.firstChild);
  }
}
