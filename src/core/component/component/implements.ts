import { IComponentContext } from './context/interfaces';

/** IMPLEMENTS **/

/**
 * Called immediately when a new Component is created
 *  - provides a 'context' used to setup variables for the template
 *  - INFO: perfect time to setup all your template's variables, and component's properties
 *  - WARN: doesnt guaranty that the component is actually into the DOM !
 */
export interface OnCreate<TData extends object> {
  onCreate(context: IComponentContext<TData>): void;
}

/**
 * Called right after the Component's style and template have finished to load and render AND if the components hasn't been destroyed meanwhile
 *  - INFO: perfect time to access the rendered components style or template (but use with caution)
 *  - WARN: doesnt guaranty that the component is actually into the DOM !
 */
export interface OnInit {
  onInit(): void;
}

/**
 * Called right after the Component has been destroyed (won't be used anymore)
 *  - INFO: perfect time to release resources like: pending timeouts, timers, pending promises, observers, etc...
 *  - INFO: guaranties that the component is completely detached from the DOM and any parents
 *  - INFO: guaranties that the component became useless: no more used in the DOM, no more properties updated, etc...
 */
export interface OnDestroy {
  onDestroy(): void;
}

/**
 * Called when the component is connected to the DOM.
 *  - INFO: use with caution
 *  - WARN: doesnt guaranty that the component's style and template are loaded and rendered (OnInit)
 */
export interface OnConnected {
  onConnected(): void;
}

/**
 * Called when the component is disconnected from the DOM.
 *  - INFO: probably called right before an OnDestroy
 *  - WARN: should probably not be used, always prefer OnDestroy
 */
export interface OnDisconnected {
  onDisconnected(): void;
}
