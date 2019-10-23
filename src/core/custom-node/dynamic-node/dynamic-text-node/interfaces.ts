import { IDynamicNode } from '../interfaces';
import { IObserver } from '@lifaon/observables';

export interface IDynamicTextNodeConstructor {
  new(): IDynamicTextNode;
}

export interface IDynamicTextNode extends IObserver<string>, IDynamicNode, Text {
}
