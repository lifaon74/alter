import { NodeStateObservableOf } from '../node-state-observable/implementation';
import { DOMState, GetNodeDOMState } from '../node-state-observable/mutations';
import { IObserver } from '@lifaon/observables';
import { INodeStateObservable } from '../node-state-observable/interfaces';

/**
 * Links an Observer with the life cycle of a Node.
 * When the node is attached to the DOM => activate the Observer
 * When the node is detached from the DOM => deactivate the Observer
 * When the node is destroyed => disconnect the Observer, ad prevent further observes
 * @param observer
 * @param node
 * @returns undo function
 */
export function BindObserverWithNodeStateObservable<T>(observer: IObserver<T>, node: Node): () => IObserver<T> {
  const nodeStateObservable: INodeStateObservable = NodeStateObservableOf(node);

  function onConnect() {
    observer.activate();
  }

  function onDisconnect() {
    observer.deactivate();
  }

  if (node.ownerDocument.contains(node)) {
    onConnect();
  } else {
    onDisconnect();
  }

  // when connected to the dom, active observer
  const connectObserver = nodeStateObservable
    .addListener('connect', onConnect).activate();

  // when disconnected of the dom, deactivate observer
  const disconnectObserver = nodeStateObservable
    .addListener('disconnect', onDisconnect).activate();

  // when node is destroyed, disconnect all locally created observer and disconnect observer
  const destroyObserver = nodeStateObservable
    .addListener('destroy', () => {
      connectObserver.disconnect();
      disconnectObserver.disconnect();
      destroyObserver.disconnect();
      observer.disconnect();
    }).activate();


  // ensures observer cannot observe any more
  const observe: any = observer.observe;
  observer.observe = (...args: any[]): any => {
    const nodeState: DOMState = GetNodeDOMState(node);
    if ((nodeState === 'destroyed') || (nodeState === 'destroying')) {
      throw new Error(`Cannot observe a destroyed node`);
    }
    return observe.apply(observer, args);
  };

  return () => {
    connectObserver.disconnect();
    disconnectObserver.disconnect();
    destroyObserver.disconnect();
    observer.observe = observe;
    return observer;
  };
}
