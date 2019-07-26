import { BindObserverWithNodeStateObservable } from '../ObserverNode';
import { IDynamicForLoopNode, IDynamicForLoopNodeConstructor, TForLoopNodeCreateNodeCallback } from './interfaces';
import { ContainerNode } from '../../container-node/implementation';
import { DestroyNodeSafe, AttachNode } from '../../node-state-observable/mutations';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { ISource, Source } from '@lifaon/observables/public';
import { ObserverFactory } from '@lifaon/observables/core/observer/implementation';


export const DYNAMIC_FOR_LOOP_NODE_PRIVATE = Symbol('dynamic-for-loop-node-private');

export interface IDynamicForLoopNodePrivate<N extends Node, T> {
  createNode: TForLoopNodeCreateNodeCallback<N, T>;
  valueNodesMap: Map<T, N[]>; // map from a value to a list of nodes (mapped to this value)
}

export interface IDynamicForLoopNodeInternal<N extends Node, T> extends IDynamicForLoopNode<N, T> {
  [DYNAMIC_FOR_LOOP_NODE_PRIVATE]: IDynamicForLoopNodePrivate<N, T>;
}


export function ConstructDynamicForLoopNode<N extends Node, T>(forLoopNode: IDynamicForLoopNode<N, T>, createNode: TForLoopNodeCreateNodeCallback<N, T>): void {
  ConstructClassWithPrivateMembers(forLoopNode, DYNAMIC_FOR_LOOP_NODE_PRIVATE);
  (forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].createNode = createNode;
  (forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].valueNodesMap = new Map<T, N[]>();

  BindObserverWithNodeStateObservable<Iterable<T>>(forLoopNode, forLoopNode);
}


const nodeToIndexEmitterMap: WeakMap<Node, ISource<number>> = new WeakMap<Node, ISource<number>>();

export function DynamicForLoopNodeOnEmit<N extends Node, T>(forLoopNode: IDynamicForLoopNode<N, T>, values: Iterable<T>): void {
  const forLoopNodeIsEmpty: boolean = ((forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].valueNodesMap.size === 0);
  const newValueNodesMap: Map<T, N[]> = new Map<T, N[]>();
  const newNodes: N[] = [];

  // 1) generate the list of nodes to remove in 'valueNodesMap',
  //    and generate the new map of nodes to insert/keep
  for (const value of values) {
    let newNode: N;

    // if: value is already present in the DOM (map has value as key),
    // get the list of nodes associated with this value, and remove the first one in 'valueNodesMap'
    // else: create the node
    if ((forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].valueNodesMap.has(value)) {
      const valueNodes: N[] = (forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].valueNodesMap.get(value);
      newNode = valueNodes.shift(); // or pop
      if (valueNodes.length === 0) {
        (forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].valueNodesMap.delete(value);
      }
    } else {
      const indexEmitter: ISource<number> = new Source<number>();
      newNode = (forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].createNode(value, indexEmitter);
      nodeToIndexEmitterMap.set(newNode, indexEmitter);
    }

    // then, insert the tuple <value, node> inside 'newValueNodesMap'
    let newValueNodes: N[];
    if (newValueNodesMap.has(value)) {
      newValueNodes = newValueNodesMap.get(value);
    } else {
      newValueNodes = [];
      newValueNodesMap.set(value, newValueNodes);
    }
    newValueNodes.push(newNode);
    newNodes.push(newNode);
  }

  // 2) remove the nodes present in valueNodesMap
  for (const [value, nodes] of (forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].valueNodesMap) {
    for (let i = 0, l = nodes.length; i < l; i++) {
      // console.log('removeChild', value);
      // this.removeChild(nodes[i]);
      DestroyNodeSafe(nodes[i]);
    }
  }

  (forLoopNode as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE].valueNodesMap = newValueNodesMap;

  // 3) insert/move nodes from newNodes
  if (newNodes.length > 0) {
    if (forLoopNodeIsEmpty) {
      const fragment: DocumentFragment = forLoopNode.ownerDocument.createDocumentFragment();
      for (let i = 0, l = newNodes.length; i < l; i++) {
        AttachNode(newNodes[i], fragment);
        // fragment.appendChild(newNodes[i]);
        const indexEmitter: ISource<number> = nodeToIndexEmitterMap.get(newNodes[i]);
        indexEmitter.emit(i);
      }
      // forLoopNode.appendChild(fragment);
      AttachNode(fragment, forLoopNode);
    } else {
      let _node: Node = forLoopNode.firstChild; // the node to replace
      for (let i = 0, l = newNodes.length; i < l; i++) {
        const node: Node = newNodes[i];

        if (node !== _node) {
          // console.log('insertBefore', i);
          // this.insertBefore(node, _node);
          AttachNode(node, forLoopNode, _node);
        }

        const indexEmitter: ISource<number> = nodeToIndexEmitterMap.get(node);
        indexEmitter.emit(i);

        _node = (node === forLoopNode.lastChild) ? null : node.nextSibling;
      }
    }
  }
}



export const DynamicForLoopNode: IDynamicForLoopNodeConstructor = class DynamicForLoopNode<N extends Node, T> extends ObserverFactory(ContainerNode) /*implements IDynamicForLoopNode<N, T>*/ {
  constructor(createNode: TForLoopNodeCreateNodeCallback<N, T>) {
    super([(values: Iterable<T>) => {
      DynamicForLoopNodeOnEmit<N, T>(this as any, values);
    }], 'FOR');
    ConstructDynamicForLoopNode<N, T>(this as any, createNode);
  }
} as IDynamicForLoopNodeConstructor;

