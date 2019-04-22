import { IDynamicNode } from '../interfaces';
import { IObserver } from '@lifaon/observables/public';

export interface IDynamicTextNodeConstructor {
  new(): IDynamicTextNode;
}

export interface IDynamicTextNode extends IObserver<string>, IDynamicNode, Text {
}