import { BindObserverWithNodeStateObservable } from '../ObserverNode';
import { IDynamicConditionalNode, IDynamicConditionalNodeConstructor, } from './interfaces';
import { ContainerNode } from '../../container-node/implementation';
import { AttachNode, DestroyNode, DetachNode } from '../../node-state-observable/mutations';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { ObserverFactory } from '@lifaon/observables/core/observer/implementation';


export const DYNAMIC_CONDITIONAL_NODE_PRIVATE = Symbol('dynamic-conditional-node-private');

export interface IDynamicConditionalNodePrivate<N extends Node> {
  node: N | null;
  createNode: () => N;
  previousValue: boolean;
  destroy: boolean;
}

export interface IDynamicConditionalNodeInternal<N extends Node> extends IDynamicConditionalNode<N> {
  [DYNAMIC_CONDITIONAL_NODE_PRIVATE]: IDynamicConditionalNodePrivate<N>;
}


export function ConstructDynamicConditionalNode<N extends Node>(conditionalNode: IDynamicConditionalNode<N>, createNode: () => N, destroy: boolean = false): void {
  ConstructClassWithPrivateMembers(conditionalNode, DYNAMIC_CONDITIONAL_NODE_PRIVATE);
  (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].node = null;
  (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].createNode = createNode;
  (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].previousValue = false;
  (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE].destroy = destroy;
  BindObserverWithNodeStateObservable<boolean>(conditionalNode, conditionalNode);
}

export function DynamicConditionalNodeOnEmit<N extends Node>(conditionalNode: IDynamicConditionalNode<N>, value: boolean): void {
  const privates: IDynamicConditionalNodePrivate<N> = (conditionalNode as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE];

  value = Boolean(value);
  if (value !== privates.previousValue) {
    privates.previousValue = value;

    if (privates.node === null) {
      privates.node = privates.createNode();
    }

    if (value) {
      AttachNode(privates.node, conditionalNode);
    } else {
      DetachNode(privates.node);

      if (privates.destroy) {
        DestroyNode(privates.node);
        privates.node = null;
      }
    }
  }
}

export const DynamicConditionalNode: IDynamicConditionalNodeConstructor = class DynamicConditionalNode<N extends Node> extends ObserverFactory(ContainerNode) /*implements IDynamicConditionalNode<Node>*/ {
  constructor(createNode: () => N, destroy?: boolean) {
    super([(value: any) => {
      DynamicConditionalNodeOnEmit<N>(this as any, value);
    }], 'IF');
    ConstructDynamicConditionalNode(this as any, createNode, destroy);
  }
} as IDynamicConditionalNodeConstructor;

