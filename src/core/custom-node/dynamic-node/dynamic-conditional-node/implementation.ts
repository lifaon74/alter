import { BindObserverWithNodeStateObservable } from '../ObserverNode';
import {
  IDynamicConditionalNode, IDynamicConditionalNodeConstructor, IDynamicConditionalNodeOptions,
} from './interfaces';
import { ContainerNode } from '../../container-node/implementation';
import { AttachNode, DestroyNode, DetachNode } from '../../node-state-observable/mutations';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { ObserverFactory } from '@lifaon/observables';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';

/** PRIVATES **/

export const DYNAMIC_CONDITIONAL_NODE_PRIVATE = Symbol('dynamic-conditional-node-private');

export interface IDynamicConditionalNodePrivate<N extends Node> {
  node: N | null;
  createNode: () => N;
  previousValue: boolean;
  destroyTimeout: number;
  destroyTimer: any | null;
}

export interface IDynamicConditionalNodePrivatesInternal<N extends Node> extends IObserverPrivatesInternal<boolean> {
  [DYNAMIC_CONDITIONAL_NODE_PRIVATE]: IDynamicConditionalNodePrivate<N>;
}

export interface IDynamicConditionalNodeInternal<N extends Node> extends IDynamicConditionalNodePrivatesInternal<N>, IDynamicConditionalNode<N> {
}

/** CONSTRUCTOR **/

export function ConstructDynamicConditionalNode<N extends Node>(
  instance: IDynamicConditionalNode<N>,
  createNode: () => N,
  options: IDynamicConditionalNodeOptions = {}
): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_CONDITIONAL_NODE_PRIVATE);
  const privates: IDynamicConditionalNodePrivate<N> = (instance as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE];
  privates.node = null;
  privates.createNode = createNode;
  privates.previousValue = false;

  if (options.destroyTimeout === void 0) {
    privates.destroyTimeout = 0;
  } else {
    privates.destroyTimeout = Math.floor(options.destroyTimeout);
  }

  privates.destroyTimer = null;

  BindObserverWithNodeStateObservable<boolean>(instance, instance);
}

/** CONSTRUCTOR FUNCTIONS **/

export function DynamicConditionalNodeOnEmit<N extends Node>(instance: IDynamicConditionalNode<N>, value: boolean): void {
  const privates: IDynamicConditionalNodePrivate<N> = (instance as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE];

  value = Boolean(value);
  if (value !== privates.previousValue) {
    privates.previousValue = value;

    if (privates.node === null) {
      privates.node = privates.createNode();
    }

    if (value) {
      AttachNode(privates.node, instance);
      DynamicConditionalStopDestroyTimer<N>(instance);
    } else {
      DetachNode(privates.node);
      DynamicConditionalStartDestroyTimer<N>(instance);
    }
  }
}

function DynamicConditionalStartDestroyTimer<N extends Node>(instance: IDynamicConditionalNode<N>): void {
  const privates: IDynamicConditionalNodePrivate<N> = (instance as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE];
  if (privates.destroyTimeout === 0) {
    DynamicConditionalDestroyNode<N>(instance);
  } else if ((0 < privates.destroyTimeout) && (privates.destroyTimeout <= Number.MAX_SAFE_INTEGER)) {
    privates.destroyTimer = setTimeout(() => {
      privates.destroyTimer = null;
      DynamicConditionalDestroyNode<N>(instance);
    }, privates.destroyTimeout);
  }
}

function DynamicConditionalStopDestroyTimer<N extends Node>(instance: IDynamicConditionalNode<N>): void {
  const privates: IDynamicConditionalNodePrivate<N> = (instance as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE];
  if (privates.destroyTimer !== null) {
    clearTimeout(privates.destroyTimer);
  }
}

function DynamicConditionalDestroyNode<N extends Node>(instance: IDynamicConditionalNode<N>): void {
  const privates: IDynamicConditionalNodePrivate<N> = (instance as IDynamicConditionalNodeInternal<N>)[DYNAMIC_CONDITIONAL_NODE_PRIVATE];
  if (privates.node !== null) {
    DestroyNode(privates.node);
    privates.node = null;
  }
}


/** CLASS **/

export const DynamicConditionalNode: IDynamicConditionalNodeConstructor = class DynamicConditionalNode<N extends Node> extends ObserverFactory<typeof ContainerNode, boolean>(ContainerNode) implements IDynamicConditionalNode<Node> {
  constructor(createNode: () => N, options?: IDynamicConditionalNodeOptions) {
    super([(value: any) => {
      DynamicConditionalNodeOnEmit<N>(this as any, value);
    }], 'IF');
    ConstructDynamicConditionalNode(this as any, createNode, options);
  }
} as IDynamicConditionalNodeConstructor;

