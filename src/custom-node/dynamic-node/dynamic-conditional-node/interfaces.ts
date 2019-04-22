import { IDynamicNode } from '../interfaces';
import { IContainerNode } from '../../container-node/interfaces';
import { IObserver } from '@lifaon/observables/public';

export interface IDynamicConditionalNodeConstructor {
  new<N extends Node>(createNode: () => N): IDynamicConditionalNode<N>;
}

export interface IDynamicConditionalNode<N extends Node> extends IObserver<boolean>, IDynamicNode, IContainerNode {
}

export type TConditionalNodeCreateNodeCallback<N extends Node> = () => N;
