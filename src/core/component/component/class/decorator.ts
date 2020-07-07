import { IComponentOptions } from '../types';
import { ComponentFactory } from './implementation';
import { Constructor } from '@lifaon/class-factory';


/**
 * DECORATOR (CLASS)
 */
export function Component(options: IComponentOptions) {
  return <TFunction extends Constructor<HTMLElement>>(target: TFunction): TFunction | void => {
    return ComponentFactory<TFunction>(target, options);
  };
}
