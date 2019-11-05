import { IDynamicNode } from '../interfaces';
import { IContainerNode } from '../../container-node/interfaces';
import { IObserver } from '@lifaon/observables';


export interface IDynamicConditionalNodeOptions {
  destroyTimeout?: number; // (default: 0): if < 0 or Infinity => never, 0 => immediate, else timeout
}

/** INTERFACES **/

export interface IDynamicConditionalNodeConstructor {
  new<N extends Node>(createNode: () => N, options?: IDynamicConditionalNodeOptions): IDynamicConditionalNode<N>;
}

export interface IDynamicConditionalNode<N extends Node> extends IObserver<boolean>, IDynamicNode, IContainerNode {
}

export type TConditionalNodeCreateNodeCallback<N extends Node> = () => N;
