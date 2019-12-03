import { Constructor } from '../../../../classes/factory';
import { IComponentOptions } from '../types';
import { DISABLED_COMPONENT_INIT } from '../constructor';
import { RegisterCustomElement } from '../../custom-element/functions';
import { AccessComponentConstructorPrivates, IComponentConstructorPrivate } from './privates';
import { IsHostBinding } from '../../host-binding/constructor';

/** FUNCTIONS **/

export function InitComponentConstructor(_class: Constructor<HTMLElement>, options: IComponentOptions): void {
  // RegisterCustomElement may create an instance of the component, so we need to disabled the init
  DISABLED_COMPONENT_INIT.add(_class);
  RegisterCustomElement(_class, options);
  DISABLED_COMPONENT_INIT.delete(_class);

  const privates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(_class);

  if (Array.isArray(options.host)) {
    for (let i = 0, l = options.host.length; i < l; i++) {
      if (IsHostBinding(options.host[i])) {
        privates.hostBindings.push(options.host[i]);
      } else {
        throw new TypeError(`Expected HostBinding at index ${ i } of options.host`);
      }
    }
  } else if (options.host !== void 0) {
    throw new TypeError(`Expected array as options.host`);
  }
}
