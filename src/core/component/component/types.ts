import { ICustomElementOptions } from '../custom-element/functions';
import { TNativePromiseLikeOrValue } from '@lifaon/observables';
import { ITemplate } from '../../template/interfaces';
import { IStyle } from '../../style/interfaces';
import { IHostBinding } from '../host-binding/interfaces';

/** TYPES **/

export interface IComponentOptions extends ICustomElementOptions {
  template?: TNativePromiseLikeOrValue<ITemplate>;
  style?: TNativePromiseLikeOrValue<IStyle>;
  host?: IHostBinding<any>[];
}
