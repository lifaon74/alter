import { IObserver } from '../../../../core/observer/interfaces';
import { IDynamicNode } from '../interfaces';

export interface IDynamicTextNodeConstructor {
  new(): IDynamicTextNode;
}

export interface IDynamicTextNode extends IObserver<string>, IDynamicNode, Text {
}