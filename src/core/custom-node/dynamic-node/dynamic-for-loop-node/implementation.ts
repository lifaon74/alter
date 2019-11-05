import { BindObserverWithNodeStateObservable } from '../ObserverNode';
import { IDynamicForLoopNode, IDynamicForLoopNodeConstructor, TForLoopNodeCreateNodeCallback } from './interfaces';
import { ContainerNode } from '../../container-node/implementation';
import { AttachNode, DestroyNodeSafe } from '../../node-state-observable/mutations';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { ISource, Source, ObserverFactory } from '@lifaon/observables';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';

/** PRIVATES **/

export const DYNAMIC_FOR_LOOP_NODE_PRIVATE = Symbol('dynamic-for-loop-node-private');

export interface IDynamicForLoopNodePrivate<N extends Node, T> {
  createNode: TForLoopNodeCreateNodeCallback<N, T>;
  valueNodesMap: Map<T, N[]>; // map from a value to a list of nodes (mapped to this value)
}

export interface IDynamicForLoopNodePrivatesInternal<N extends Node, T> extends IObserverPrivatesInternal<Iterable<T>> {
  [DYNAMIC_FOR_LOOP_NODE_PRIVATE]: IDynamicForLoopNodePrivate<N, T>;
}

export interface IDynamicForLoopNodeInternal<N extends Node, T> extends IDynamicForLoopNodePrivatesInternal<N, T>, IDynamicForLoopNode<N, T> {
}


/** CONSTRUCTOR **/

export function ConstructDynamicForLoopNode<N extends Node, T>(instance: IDynamicForLoopNode<N, T>, createNode: TForLoopNodeCreateNodeCallback<N, T>): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_FOR_LOOP_NODE_PRIVATE);
  const privates: IDynamicForLoopNodePrivate<N, T> = (instance as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE];
  privates.createNode = createNode;
  privates.valueNodesMap = new Map<T, N[]>();

  BindObserverWithNodeStateObservable<Iterable<T>>(instance, instance);
}


/** CONSTRUCTOR FUNCTIONS **/

const nodeToIndexEmitterMap: WeakMap<Node, ISource<number>> = new WeakMap<Node, ISource<number>>();

export function DynamicForLoopNodeOnEmit<N extends Node, T>(instance: IDynamicForLoopNode<N, T>, values: Iterable<T>): void {
  const privates: IDynamicForLoopNodePrivate<N, T> = (instance as IDynamicForLoopNodeInternal<N, T>)[DYNAMIC_FOR_LOOP_NODE_PRIVATE];
  const instanceIsEmpty: boolean = (privates.valueNodesMap.size === 0);
  const newValueNodesMap: Map<T, N[]> = new Map<T, N[]>();
  const newNodes: N[] = [];

  // 1) generate the list of nodes to remove in 'valueNodesMap',
  //    and generate the new map of nodes to insert/keep
  const valuesIterator: Iterator<T> = values[Symbol.iterator]();
  let valuesIteratorResult: IteratorResult<T>;
  while (!(valuesIteratorResult = valuesIterator.next()).done) {
    const value: T = valuesIteratorResult.value;
    let newNode: N;

    // if: value is already present in the DOM (map has value as key),
    // get the list of nodes associated with this value, and remove the first one in 'valueNodesMap'
    // else: create the node
    if (privates.valueNodesMap.has(value)) {
      const valueNodes: N[] = privates.valueNodesMap.get(value) as N[];
      newNode = valueNodes.shift() as N; // or pop
      if (valueNodes.length === 0) {
        privates.valueNodesMap.delete(value);
      }
    } else {
      const indexEmitter: ISource<number> = new Source<number>();
      newNode = privates.createNode(value, indexEmitter);
      nodeToIndexEmitterMap.set(newNode, indexEmitter);
    }

    // then, insert the tuple <value, node> inside 'newValueNodesMap'
    let newValueNodes: N[];
    if (newValueNodesMap.has(value)) {
      newValueNodes = newValueNodesMap.get(value) as N[];
    } else {
      newValueNodes = [];
      newValueNodesMap.set(value, newValueNodes);
    }
    newValueNodes.push(newNode);
    newNodes.push(newNode);
  }

  // 2) remove the nodes present in valueNodesMap
  const valueNodeMapEntriesIterator: Iterator<N[]> = privates.valueNodesMap.values();
  let valueNodeMapEntriesIteratorResult: IteratorResult<N[]>;
  while (!(valueNodeMapEntriesIteratorResult = valueNodeMapEntriesIterator.next()).done) {
    const nodes: N[] = valueNodeMapEntriesIteratorResult.value;
    for (let i = 0, l = nodes.length; i < l; i++) {
      // console.log('removeChild', value);
      // this.removeChild(nodes[i]);
      DestroyNodeSafe(nodes[i]);
    }
  }

  privates.valueNodesMap = newValueNodesMap;

  // 3) insert/move nodes from newNodes
  if (newNodes.length > 0) {
    if (instanceIsEmpty) {
      const fragment: DocumentFragment = (instance.ownerDocument as Document).createDocumentFragment();
      for (let i = 0, l = newNodes.length; i < l; i++) {
        AttachNode(newNodes[i], fragment);
        // fragment.appendChild(newNodes[i]);
        const indexEmitter: ISource<number> = nodeToIndexEmitterMap.get(newNodes[i]) as ISource<number>;
        indexEmitter.emit(i);
      }
      // instance.appendChild(fragment);
      AttachNode(fragment, instance);
    } else {
      let _node: Node | null = instance.firstChild; // the node to replace
      for (let i = 0, l = newNodes.length; i < l; i++) {
        const node: Node = newNodes[i];

        if (node !== _node) {
          // console.log('insertBefore', i);
          // this.insertBefore(node, _node);
          AttachNode(node, instance, _node);
        }

        const indexEmitter: ISource<number> = nodeToIndexEmitterMap.get(node) as ISource<number>;
        indexEmitter.emit(i);

        _node = (node === instance.lastChild) ? null : node.nextSibling;
      }
    }
  }
}

/** CLASS **/

export const DynamicForLoopNode: IDynamicForLoopNodeConstructor = class DynamicForLoopNode<N extends Node, T> extends ObserverFactory<typeof ContainerNode, Iterable<any>>(ContainerNode) implements IDynamicForLoopNode<N, T> {
  constructor(createNode: TForLoopNodeCreateNodeCallback<N, T>) {
    super([(values: Iterable<T>) => {
      DynamicForLoopNodeOnEmit<N, T>(this as any, values);
    }], 'FOR');
    ConstructDynamicForLoopNode<N, T>(this as any, createNode);
  }
} as IDynamicForLoopNodeConstructor;

