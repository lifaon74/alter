import { BindObserverWithNodeStateObservable } from '../ObserverNode';
import { IDynamicTextNode, IDynamicTextNodeConstructor } from './interfaces';
import { ObserverFactory } from '@lifaon/observables/src/core/observer/implementation';

// export const DYNAMIC_TEXT_NODE_PRIVATE = Symbol('dynamic-text-node-private');
//
// export interface IDynamicTextNodePrivate {
// }
//
// export interface IDynamicTextNodeInternal extends IDynamicTextNode {
//   [DYNAMIC_TEXT_NODE_PRIVATE]: IDynamicTextNodePrivate;
// }


export function ConstructDynamicTextNode<T>(textNode: IDynamicTextNode): void {
  // ConstructClassWithPrivateMembers(textNode, DYNAMIC_TEXT_NODE_PRIVATE);
  BindObserverWithNodeStateObservable<string>(textNode, textNode);
}



export const DynamicTextNode: IDynamicTextNodeConstructor = class DynamicTextNode extends ObserverFactory(Text) /*implements IDynamicTextNode*/ {
  constructor() {
    super([(value: string) => {
      this.data = value;
    }]);
    ConstructDynamicTextNode(this as any);
  }
} as IDynamicTextNodeConstructor;

