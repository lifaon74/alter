import { IComponent} from './interfaces';
import { INotificationsObservableContext, TNativePromiseLikeOrValue } from '@lifaon/observables';
import { ITemplate } from '../../template/interfaces';
import { FreezeComponentContext } from './context/functions';
import { COMPONENT_PRIVATE, IComponentInternal, IComponentPrivate } from './privates';
import { IHostBinding } from '../host-binding/interfaces';
import { DOMState, GetNodeDOMState } from '../../custom-node/node-state-observable/mutations';
import { NodeStateObservable } from '../../custom-node/node-state-observable/implementation';
import { IComponentContextAttributeListenerKeyValueMap } from './context/types';
import { COMPONENT_CONTEXT_PRIVATE, IComponentContextInternal } from './context/privates';
import { IStyle } from '../../style/interfaces';
import { IComponentOptions } from './types';
import { AccessComponentConstructorPrivates, IComponentConstructorPrivate } from './class/privates';
import { Constructor } from '@lifaon/class-factory';

/** FUNCTIONS **/

/**
 * Initializes a Component
 *  - call proper 'init' functions (onCreate, onInit)
 *  - load and apply style, template, and host bindings
 *  - releases resources on destroy (and calls onDestroy)
 */
export function InitComponent<TData extends object>(instance: IComponent<TData>, options: IComponentOptions): void {
  const privates: IComponentPrivate<TData> = (instance as IComponentInternal<TData>)[COMPONENT_PRIVATE];

  if (typeof instance.onCreate === 'function') {
    instance.onCreate.call(instance, privates.context);
  }

  const constructorPrivates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(instance.constructor as Constructor<IComponent<TData>>);

  // INFO: could use CancellablePromise
  Promise.all([
    Promise.all(
      constructorPrivates.hostBindings.map((hostBinding: IHostBinding<any>) => hostBinding.resolve(instance))
    ),
    LoadComponentTemplate<TData>(instance, options.template),
    LoadComponentStyle<TData>(instance, options.style),
  ]).then(() => {
    const state: DOMState = GetNodeDOMState(instance);
    if ((typeof instance.onInit === 'function') && (state !== 'destroying') && (state !== 'destroyed')) {
      instance.onInit.call(instance);
    }
  });

  const destroyObserver = NodeStateObservable.of(instance)
    .addListener('destroy', () => {
      destroyObserver.disconnect();
      if (typeof instance.onDestroy === 'function') {
        instance.onDestroy.call(instance);
      }
    }).activate();
}

/**
 * Loads and inserts 'template' into the dom
 *  - freezes the context
 */
export function LoadComponentTemplate<TData extends object>(instance: IComponent<TData>, template?: TNativePromiseLikeOrValue<ITemplate>): Promise<void> {
  if (template === void 0) {
    return Promise.resolve();
  } else {
    return Promise.resolve(template)
      .then((template: ITemplate) => {
        const privates: IComponentPrivate<TData> = (instance as IComponentInternal<TData>)[COMPONENT_PRIVATE];
        FreezeComponentContext(privates.context);
        return template.insert(privates.context.data, instance, 'destroy');
      });
  }
}

/**
 * Loads and inserts 'style' into the dom
 */
export function LoadComponentStyle<TData extends object>(instance: IComponent<TData>, style?: TNativePromiseLikeOrValue<IStyle>): Promise<any> {
  if (style === void 0) {
    return Promise.resolve();
  } else {
    return Promise.resolve(style)
      .then((style: IStyle) => {
        return style.insert(instance);
      });
  }
}


/**
 * Function to call when the component is connected to the DOM
 */
export function EmitConnectedForComponent<TData extends object>(instance: IComponent<TData>): void {
  if ((typeof instance.onConnected === 'function') && instance.isConnected) {
    instance.onConnected.call(instance);
  }
}

/**
 * Function to call when the component is disconnected from the DOM
 */
export function EmitDisconnectedForComponent<TData extends object>(instance: IComponent<TData>): void {
  if ((typeof instance.onDisconnected === 'function') && !instance.isConnected) {
    instance.onDisconnected.call(instance);
  }
}

/**
 * Function to call when an attribute changed
 */
export function EmitAttributeChangeForComponent<TData extends object>(instance: IComponent<TData>, name: string, oldValue: string, newValue: string): void {
  const context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap> = ((instance as IComponentInternal<TData>)[COMPONENT_PRIVATE].context as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].context;
  context.dispatch(name, { previous: oldValue, current: newValue }); // TODO improve
}
