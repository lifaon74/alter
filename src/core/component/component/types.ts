import { ICustomElementOptions } from '../custom-element/functions';
import { TPromiseOrValue } from '@lifaon/observables';
import { ITemplate } from '../../template/interfaces';
import { IStyle } from '../../style/interfaces';
import { IHostBinding } from '../host-binding/interfaces';

/** TYPES **/

export interface IComponentOptions extends ICustomElementOptions {
  template?: TPromiseOrValue<ITemplate>;
  style?: TPromiseOrValue<IStyle>;
  host?: IHostBinding<any>[];
}
