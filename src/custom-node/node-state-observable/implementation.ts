import {
  INodeStateObservable, INodeStateObservableKeyValueMap, TNodeState, TNodeStateObservableBeforeAttachPreventableType,
  TNodeStateObservableBeforeDetachPreventableType,
} from './interfaces';
import {
  INotificationsObservableContext, IObserver, IPreventable, NotificationsObservable,
  Observer, DOMChangeObservable, IDOMChangeObservable
} from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../misc/helpers/ClassWithPrivateMembers';
import { IReferenceNode, TReferenceNodeMutation } from '../reference-node/interfaces';
import { ReferenceNodeUpdate, CommentReferenceNode } from '../reference-node/implementation';


export const NODE_STATE_OBSERVABLE_PRIVATE = Symbol('node-state-observable-private');

export interface INodeStateObservablePrivate {
  context: INotificationsObservableContext<INodeStateObservableKeyValueMap>;
  node: Node;

  referenceNode: IReferenceNode | null;
  useDOMObserver: boolean;

  domChangeObserver: IObserver<void>;

  attachDetected: boolean;
  detachDetected: boolean;
  state: TNodeState;
}

export interface INodeStateObservableInternal extends INodeStateObservable {
  [NODE_STATE_OBSERVABLE_PRIVATE]: INodeStateObservablePrivate;
}



export const NodeToNodeStateObservablesWeakMap: WeakMap<Node, INodeStateObservable[]> = new WeakMap<Node, INodeStateObservable[]>();

/**
 * Creates/gets an uniq NodeStateObservable per node
 * @param node
 */
export function NodeStateObservableOf(node: Node): INodeStateObservable {
  if (NodeToNodeStateObservablesWeakMap.has(node)) {
    return NodeToNodeStateObservablesWeakMap.get(node)[0];
  } else {
    return new NodeStateObservable(node);
  }
}


export const StaticDOMChangeObservable: IDOMChangeObservable = new DOMChangeObservable();

export function ConstructNodeStateObservable(
  observable: INodeStateObservable,
  context: INotificationsObservableContext<INodeStateObservableKeyValueMap>,
  node: Node
): void {
  ConstructClassWithPrivateMembers(observable, NODE_STATE_OBSERVABLE_PRIVATE);
  const privates: INodeStateObservablePrivate = (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  privates.context = context;
  privates.node = node;

  privates.referenceNode = null;
  privates.useDOMObserver = false;

  privates.domChangeObserver = new Observer<void>(() => {
    // something append in the DOM
    // console.warn('DOM detect');

    const mutation: TReferenceNodeMutation = privates.referenceNode.inferMutation();
    const connected: boolean = privates.node.ownerDocument.contains(privates.node);

    if (mutation !== 'none') {
      ReferenceNodeUpdate(privates.referenceNode);

      if ((mutation === 'detach') || (mutation === 'move')) {
        if (!privates.detachDetected) {
          // console.log('DOM detach');
          NodeStateObservableOnAfterDetach(observable);
          NodeStateObservableOnMutationDisconnect(observable);
        }
      }

      if ((mutation === 'attach') || (mutation === 'move')) {
        if (!privates.attachDetected) {
          // console.log('DOM attach');
          NodeStateObservableOnAfterAttach(observable);
          if (connected) {
            NodeStateObservableOnMutationConnect(observable);
          }
        }
      }
    }

    privates.attachDetected = false;
    privates.detachDetected = false;

    if ((privates.state === 'connected') !== connected) { // not detected
      console.warn('DOM state not detected');
      if (connected) {
        NodeStateObservableOnMutationConnect(observable);
      } else {
        NodeStateObservableOnMutationDisconnect(observable);
      }
      privates.state = connected ? 'connected' : 'disconnected';
    }
  }).observe(StaticDOMChangeObservable);

  privates.attachDetected = false;
  privates.detachDetected = false;
  privates.state = privates.node.ownerDocument.contains(privates.node) ? 'connected' : 'disconnected';

  // register observable
  if (!NodeToNodeStateObservablesWeakMap.has(node)) {
    NodeToNodeStateObservablesWeakMap.set(node, []);
  }
  NodeToNodeStateObservablesWeakMap.get(node).push(observable);
}



/** HANDLERS FOR MUTATIONS EVENTS **/

/**
 * Triggered when the AttachNode function is called, before attaching the node to its parent
 * @param observable
 * @param preventable
 */
export function NodeStateObservableOnMutationBeforeAttach(observable: INodeStateObservable, preventable: IPreventable<TNodeStateObservableBeforeAttachPreventableType>): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('beforeAttach', preventable);
}

/**
 * Triggered when the DetachNode function is called, before detaching the node from its parent
 * @param observable
 * @param preventable
 */
export function NodeStateObservableOnMutationBeforeDetach(observable: INodeStateObservable, preventable: IPreventable<TNodeStateObservableBeforeDetachPreventableType>): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('beforeDetach', preventable);
}


/**
 * Triggered when the AttachNode function is called, after the node is attached to its parent
 * @param observable
 */
export function NodeStateObservableOnMutationAfterAttach(observable: INodeStateObservable): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].attachDetected = true;
  NodeStateObservableOnAfterAttach(observable);
}

/**
 * Triggered when an 'afterAttach' is detected
 * @param observable
 */
export function NodeStateObservableOnAfterAttach(observable: INodeStateObservable): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('afterAttach', void 0);
}


/**
 * Triggered when the DetachNode function is called, after the node is detached from its parent
 * @param observable
 */
export function NodeStateObservableOnMutationAfterDetach(observable: INodeStateObservable): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].detachDetected = true;
  NodeStateObservableOnAfterDetach(observable);
}

/**
 * Triggered when an 'afterDetach' is detected
 * @param observable
 */
export function NodeStateObservableOnAfterDetach(observable: INodeStateObservable): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('afterDetach', void 0);
}

/**
 * Triggered when a 'connect' is detected
 * @param observable
 */
export function NodeStateObservableOnMutationConnect(observable: INodeStateObservable): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].state = 'connected';
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('connect', void 0);
}

/**
 * Triggered when a 'disconnect' is detected
 * @param observable
 */
export function NodeStateObservableOnMutationDisconnect(observable: INodeStateObservable): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].state = 'disconnected';
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('disconnect', void 0);
}

/**
 * Triggered when a 'destroy' is detected
 * @param observable
 */
export function NodeStateObservableOnMutationDestroy(observable: INodeStateObservable): void {
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].state = 'destroyed';
  NodeStateObservableDeactivateDOMObserver(observable);
  (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('destroy', void 0);
}



/**
 * Iterates over the NodeStateObservables observing this node
 * @param node
 * @param callback
 */
export function ForEachNodeStateObservablesOfNode(node: Node, callback: (observable: INodeStateObservable) => void): void {
  if (NodeToNodeStateObservablesWeakMap.has(node)) {
    const observables: INodeStateObservableInternal[] = (NodeToNodeStateObservablesWeakMap.get(node) as INodeStateObservableInternal[]);
    for (let i = 0, l = observables.length; i < l; i++) {
      callback(observables[i]);
    }
  }
}

/**
 * Iterates over the NodeStateObservables observing this node and all its sub nodes
 * @param node
 * @param callback
 */
export function ForEachNodeStateObservablesOfNodeTree(node: Node, callback: (observable: INodeStateObservable) => void): void {
  ForEachNodeStateObservablesOfNode(node, callback);
  const treeWalker: TreeWalker = document.createTreeWalker(node);
  while (treeWalker.nextNode()) {
    ForEachNodeStateObservablesOfNode(treeWalker.currentNode, callback);
  }
}



export function NodeStateObservableActivateDOMObserver(observable: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  if (!privates.domChangeObserver.activated) {
    if (privates.referenceNode === null) {
      privates.referenceNode = new CommentReferenceNode(privates.node);
    }
    privates.referenceNode.update();
    privates.domChangeObserver.activate();
  }
}


export function NodeStateObservableDeactivateDOMObserver(observable: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  if (privates.domChangeObserver.activated) {
    privates.domChangeObserver.deactivate();
    if (privates.referenceNode.parentNode !== null) {
      privates.referenceNode.parentNode.removeChild(privates.referenceNode);
    }
  }
}


export function NodeStateObservableUpdateDOMObserverState(observable: INodeStateObservable): void {
  if (
    !(observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver
    && (observable.observers.length === 0)
  ) {
    NodeStateObservableDeactivateDOMObserver(observable);
  } else if (
    (observable as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver
    && (observable.observers.length > 0)
  ) {
    NodeStateObservableActivateDOMObserver(observable);
  }
}

export function NodeStateObservableUseDOMObserver(observable: INodeStateObservable, use: boolean): void {
  if (use !== ((observable as unknown) as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver) {
    ((observable as unknown) as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver = use;
    NodeStateObservableUpdateDOMObserverState(observable);
  }
}




export class NodeStateObservable extends NotificationsObservable<INodeStateObservableKeyValueMap> implements INodeStateObservable {

  static of(node: Node): INodeStateObservable {
    return NodeStateObservableOf(node);
  }

  static useDOMObserver: boolean = false;

  constructor(node: Node) {
    let context: INotificationsObservableContext<INodeStateObservableKeyValueMap> = void 0;
    super((_context: INotificationsObservableContext<INodeStateObservableKeyValueMap>) => {
      context = _context;
      return {
        onObserved: (): void => {
          NodeStateObservableUpdateDOMObserverState(this);
        },
        onUnobserved: (): void => {
          NodeStateObservableUpdateDOMObserverState(this);
        }
      };
    });

    ConstructNodeStateObservable(this, context, node);

    if (NodeStateObservable.useDOMObserver) {
      this.useDOMObserver(true);
    }
  }

  get state(): TNodeState {
    return ((this as unknown) as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].state;
  }

  useDOMObserver(use: boolean = true): this {
    NodeStateObservableUseDOMObserver(this, use);
    return this;
  }
}

