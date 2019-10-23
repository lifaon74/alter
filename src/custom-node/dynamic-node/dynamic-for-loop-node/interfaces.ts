import { IDynamicNode } from '../interfaces';
import { IContainerNode } from '../../container-node/interfaces';
import { IObservable, IObserver } from '@lifaon/observables';

export interface IDynamicForLoopNodeConstructor {
  new<N extends Node, T>(createNode: TForLoopNodeCreateNodeCallback<N, T>): IDynamicForLoopNode<N, T>;
}

export interface IDynamicForLoopNode<N extends Node, T> extends IObserver<Iterable<T>>, IDynamicNode, IContainerNode {
}

export type TForLoopNodeCreateNodeCallback<N extends Node, T> = (item: T, index: IObservable<number>) => N;
