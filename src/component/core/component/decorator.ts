import { IComponentOptions } from './interfaces';
import { Constructor } from '../../../classes/factory';
import { ComponentFactory } from './implementation';

/**
 * DECORATOR
 * @param options
 */
export function Component(options: IComponentOptions) {
  return <TFunction extends Constructor<HTMLElement>>(target: TFunction): TFunction | void => {
    return ComponentFactory<TFunction>(target, options);
  };
}
