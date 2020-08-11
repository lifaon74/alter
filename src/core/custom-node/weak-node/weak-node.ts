import {
  IFinalizationRegistryConstructor, IWeakRef, IWeakRefConstructor
} from '../node-state-observable/weak-ref-interfaces';

declare const WeakRef: IWeakRefConstructor;
declare const FinalizationRegistry: IFinalizationRegistryConstructor;

/** FUNCTIONS **/

// export function CreateWeakNode<G extends Node>(node: G, onDestroy?: () => void): IWeakRef<G> {
//   const weakRef = new WeakRef<G>(node);
//
//   const finalizer = new FinalizationRegistry(onDestroy);
//   finalizer.register(node);
// }
//
// export function OnWeakRefDestroyed(weakRef: IWeakRef<any>, onDestroy: () => void): void {
//   requestIdleCallback()
//   setImmediate();
// }
