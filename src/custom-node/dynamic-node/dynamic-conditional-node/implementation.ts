import { BindObserverWithNodeStateObservable } from '../ObserverNode';
import { IDynamicConditionalNode, IDynamicConditionalNodeConstructor, } from './interfaces';
import { ContainerNode } from '../../container-node/implementation';
import { AttachNode, DetachNode } from '../../node-state-observable/mutations';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { ObserverFactory } from '@lifaon/observables/core/observer/implementation';


export const DYNAMIC_CONDITIONAL_NODE_PRIVATE = Symbol('dynamic-conditional-node-private');

export interface IDynamicConditionalNodePrivate<N extends Node> {
  node: N | null;
  createNode: () => N;
  previousValue: boolean;
}

export interface IDynamicConditionalNodeInternal<N extends Node> extends IDynamicConditionalNode<N> {
  [DYNAMIC_CONDITIONAL_NODE_PRIVATE]: IDynamicConditionalNodePrivate<N>;
}


export function ConstructDynamicConditionalNode<N extends Node>(conditionalNode: IDynamicConditionalNode<N>, createNode: () => N): void {
  ConstructClassWithPrivateMembers(conditionalNode, DYNAMIC_CONDITIONAL_NODE_PRIVATE);
  (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].node = null;
  (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].createNode = createNode;
  (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].previousValue = false;
  BindObserverWithNodeStateObservable<boolean>(conditionalNode, conditionalNode);
}

export function DynamicConditionalNodeOnEmit<N extends Node>(conditionalNode: IDynamicConditionalNode<N>, value: boolean): void {
  value = Boolean(value);
  if (value !== (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].previousValue) {
    (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].previousValue = value;

    if ( (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].node === null) {
      (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].node = (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].createNode();
    }

    if (value) {
      AttachNode((conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].node, conditionalNode);
    } else {
      DetachNode((conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].node);
    }
  }
}

export const DynamicConditionalNode: IDynamicConditionalNodeConstructor = class DynamicConditionalNode<N extends Node> extends ObserverFactory(ContainerNode) implements IDynamicConditionalNode<Node> {
  constructor(createNode: () => N) {
    super([(value: any) => {
      DynamicConditionalNodeOnEmit<N>(this, value);
    }], 'IF');
    ConstructDynamicConditionalNode(this, createNode);
  }
};

