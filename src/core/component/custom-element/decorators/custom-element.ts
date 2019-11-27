import { Constructor } from '../../../../classes/factory';
import { ICustomElementOptions, RegisterCustomElement } from '../functions';

/**
 * DECORATOR (CLASS)
 *  => see RegisterCustomElement
 */
export function CustomElement(options: ICustomElementOptions) {
  return <TFunction extends Constructor<HTMLElement>>(target: TFunction): TFunction | void => {
    RegisterCustomElement<TFunction>(target, options);
    return target;
  };
}
