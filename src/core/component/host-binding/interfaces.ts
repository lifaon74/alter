import { IHostBindingOptions, THostBindingOnResolve } from './types';


/** INTERFACES **/

/**
 * An HostBinding is a link between a "template attribute syntax" (see 'parseAttribute') and a future node.
 *  - 'attributeName' will be parsed and applied to the nodes provided when calling the 'resolve' method
 *  - 'onResolve' is a function executed when 'resolve' is called. It must return a value which will be used as a data source for the "attribute syntax".
 *
 *  INFO: HostBinding is probably easier to use with the decorator @HostBind
 */
export interface IHostBindingConstructor {
  new<T>(attributeName: string, onResolve: THostBindingOnResolve<T>, options?: IHostBindingOptions): IHostBinding<T>;
}

export interface IHostBinding<T> {
  readonly attributeName: string;

  /**
   * Call this function to apply this HostBinding to a Node
   */
  resolve(node: Element): Promise<void>;
}

