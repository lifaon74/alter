import { GetOrCreateNodeStateObservable } from '../node-state-observable/implementation';
import { DOMState, GetNodeDOMState } from '../node-state-observable/mutations';
import { IObserver } from '@lifaon/observables/public';


export function BindObserverWithNodeStateObservable<T>(observer: IObserver<T>, node: Node): void {
  const nodeStateObservable = GetOrCreateNodeStateObservable(node);

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
}
