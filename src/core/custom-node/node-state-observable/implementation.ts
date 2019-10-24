import {
  INodeStateObservable, INodeStateObservableKeyValueMap, TNodeState, TNodeStateObservableBeforeAttachPreventableType,
  TNodeStateObservableBeforeDetachPreventableType,
} from './interfaces';
import {
  DOMChangeObservable, IDOMChangeObservable, INotificationsObservableContext, IObserver, IPreventable,
  NotificationsObservable, Observer
} from '@lifaon/observables';

import { IReferenceNode, TReferenceNodeMutation } from '../reference-node/interfaces';
import { CommentReferenceNode, ReferenceNodeUpdate } from '../reference-node/implementation';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';


/** CONSTRUCTOR **/

export const NODE_STATE_OBSERVABLE_PRIVATE = Symbol('node-state-instance-private');

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


export const STATIC_DOM_CHANGE_OBSERVABLE: IDOMChangeObservable = new DOMChangeObservable();

export function ConstructNodeStateObservable(
  instance: INodeStateObservable,
  context: INotificationsObservableContext<INodeStateObservableKeyValueMap>,
  node: Node
): void {
  ConstructClassWithPrivateMembers(instance, NODE_STATE_OBSERVABLE_PRIVATE);
  const privates: INodeStateObservablePrivate = (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  const doc: Document | null = node.ownerDocument;
  if (doc === null) {
    throw new Error(`Expected node having an ownerDocument`);
  } else {
    privates.context = context;
    privates.node = node;

    privates.referenceNode = null;
    privates.useDOMObserver = false;

    privates.domChangeObserver = new Observer<void>(() => {
      // something append in the DOM

      const mutation: TReferenceNodeMutation = (privates.referenceNode as IReferenceNode).inferMutation();
      const connected: boolean = doc.contains(privates.node);
      // console.warn('DOM detect', mutation);

      if (mutation !== 'none') {
        ReferenceNodeUpdate(privates.referenceNode as IReferenceNode);

        if ((mutation === 'detach') || (mutation === 'move')) {
          if (!privates.detachDetected) {
            // console.log('DOM detach');
            NodeStateObservableOnAfterDetach(instance);
            NodeStateObservableOnMutationDisconnect(instance);
          }
        }

        if ((mutation === 'attach') || (mutation === 'move')) {
          if (!privates.attachDetected) {
            // console.log('DOM attach');
            NodeStateObservableOnAfterAttach(instance);
            if (connected) {
              NodeStateObservableOnMutationConnect(instance);
            }
          }
        }
      }

      privates.attachDetected = false;
      privates.detachDetected = false;

      if ((privates.state === 'connected') !== connected) { // node itself didnt update but one of its parent may have
        if (connected) {
          NodeStateObservableOnMutationConnect(instance);
        } else {
          NodeStateObservableOnMutationDisconnect(instance);
        }
        privates.state = connected ? 'connected' : 'disconnected';
      }
    }).observe(STATIC_DOM_CHANGE_OBSERVABLE);

    privates.attachDetected = false;
    privates.detachDetected = false;
    privates.state = doc.contains(privates.node) ? 'connected' : 'disconnected';

    // register instance
    if (!NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP.has(node)) {
      NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP.set(node, []);
    }
    (NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP.get(node) as INodeStateObservable[]).push(instance);
  }
}

/** FUNCTIONS **/

/** HANDLERS FOR MUTATIONS EVENTS **/

/**
 * Must be called when the AttachNode function is executed, before attaching the node to its parent
 */
export function NodeStateObservableOnMutationBeforeAttach(instance: INodeStateObservable, preventable: IPreventable<TNodeStateObservableBeforeAttachPreventableType>): void {
  (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('beforeAttach', preventable);
}

/**
 * Must be called when the DetachNode function is executed, before detaching the node from its parent
 */
export function NodeStateObservableOnMutationBeforeDetach(instance: INodeStateObservable, preventable: IPreventable<TNodeStateObservableBeforeDetachPreventableType>): void {
  (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('beforeDetach', preventable);
}


/**
 * Must be called when the AttachNode function is executed, after the node is attached to its parent
 */
export function NodeStateObservableOnMutationAfterAttach(instance: INodeStateObservable): void {
  (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].attachDetected = true;
  NodeStateObservableOnAfterAttach(instance);
}

/**
 * Must be called when an 'afterAttach' is detected
 */
export function NodeStateObservableOnAfterAttach(instance: INodeStateObservable): void {
  (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('afterAttach', void 0);
}


/**
 * Must be called when the DetachNode function is executed, after the node is detached from its parent
 */
export function NodeStateObservableOnMutationAfterDetach(instance: INodeStateObservable): void {
  (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].detachDetected = true;
  NodeStateObservableOnAfterDetach(instance);
}

/**
 * Must be called when an 'afterDetach' is detected
 */
export function NodeStateObservableOnAfterDetach(instance: INodeStateObservable): void {
  (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].context.dispatch('afterDetach', void 0);
}

/**
 * Must be called when a 'connect' is detected
 */
export function NodeStateObservableOnMutationConnect(instance: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];
  privates.state = 'connected';
  privates.context.dispatch('connect', void 0);
}

/**
 * Must be called when a 'disconnect' is detected
 */
export function NodeStateObservableOnMutationDisconnect(instance: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];
  privates.state = 'disconnected';
  privates.context.dispatch('disconnect', void 0);
}

/**
 * Must be called when a 'destroy' is detected
 */
export function NodeStateObservableOnMutationDestroy(instance: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];
  privates.state = 'destroyed';
  NodeStateObservableDeactivateDOMObserver(instance);
  privates.context.dispatch('destroy', void 0);
}


/** ITERATORS **/

/**
 * Iterates over the NodeStateObservables observing this node
 */
export function ForEachNodeStateObservablesOfNode(node: Node, callback: (instance: INodeStateObservable) => void): void {
  if (NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP.has(node)) {
    const instances: INodeStateObservableInternal[] = (NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP.get(node) as INodeStateObservableInternal[]);
    for (let i = 0, l = instances.length; i < l; i++) {
      callback(instances[i]);
    }
  }
}

/**
 * Iterates over the NodeStateObservables observing this node and all its sub nodes
 */
export function ForEachNodeStateObservablesOfNodeTree(node: Node, callback: (instance: INodeStateObservable) => void): void {
  ForEachNodeStateObservablesOfNode(node, callback);
  const treeWalker: TreeWalker = document.createTreeWalker(node);
  while (treeWalker.nextNode()) {
    ForEachNodeStateObservablesOfNode(treeWalker.currentNode, callback);
  }
}


/** ACTIVATE/DEACTIVATE **/

export function NodeStateObservableActivateDOMObserver(instance: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  if (!privates.domChangeObserver.activated) {
    if (privates.referenceNode === null) {
      privates.referenceNode = new CommentReferenceNode(privates.node);
    }
    privates.referenceNode.update();
    privates.domChangeObserver.activate();
  }
}


export function NodeStateObservableDeactivateDOMObserver(instance: INodeStateObservable): void {
  const privates: INodeStateObservablePrivate = (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];

  if (privates.domChangeObserver.activated) {
    privates.domChangeObserver.deactivate();
    if ((privates.referenceNode as IReferenceNode).parentNode !== null) {
      ((privates.referenceNode as IReferenceNode).parentNode as Node).removeChild(privates.referenceNode as IReferenceNode);
    }
  }
}


export function NodeStateObservableUpdateDOMObserverState(instance: INodeStateObservable): void {
  if (
    !(instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver
    && (instance.observers.length === 0)
  ) {
    NodeStateObservableDeactivateDOMObserver(instance);
  } else if (
    (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].useDOMObserver
    && (instance.observers.length > 0)
  ) {
    NodeStateObservableActivateDOMObserver(instance);
  }
}


/** STATIC METHODS **/

export const NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP: WeakMap<Node, INodeStateObservable[]> = new WeakMap<Node, INodeStateObservable[]>();

/**
 * Creates/gets an uniq NodeStateObservable per node
 */
export function NodeStateObservableStaticOf(node: Node): INodeStateObservable {
  if (NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP.has(node)) {
    return (NODE_TO_NODE_STATE_OBSERVABLES_WEAK_MAP.get(node) as INodeStateObservable[])[0];
  } else {
    return new NodeStateObservable(node);
  }
}

/** METHODS **/

export function NodeStateObservableGetState(instance: INodeStateObservable): TNodeState {
  return (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE].state;
}

export function NodeStateObservableUseDOMObserver(instance: INodeStateObservable, use: boolean): void {
  const privates: INodeStateObservablePrivate = (instance as INodeStateObservableInternal)[NODE_STATE_OBSERVABLE_PRIVATE];
  if (use !== privates.useDOMObserver) {
    privates.useDOMObserver = use;
    NodeStateObservableUpdateDOMObserverState(instance);
  }
}


/** CLASS **/

export class NodeStateObservable extends NotificationsObservable<INodeStateObservableKeyValueMap> implements INodeStateObservable {


  static of(node: Node): INodeStateObservable {
    return NodeStateObservableStaticOf(node);
  }

  static useDOMObserver: boolean = false;

  constructor(node: Node) {
    let context: INotificationsObservableContext<INodeStateObservableKeyValueMap>;
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

    // @ts-ignore
    ConstructNodeStateObservable(this, context, node);

    if (NodeStateObservable.useDOMObserver) {
      this.useDOMObserver(true);
    }
  }

  get state(): TNodeState {
    return NodeStateObservableGetState(this);
  }

  useDOMObserver(use: boolean = true): this {
    NodeStateObservableUseDOMObserver(this, use);
    return this;
  }
}

