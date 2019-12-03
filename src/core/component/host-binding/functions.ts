import { IHostBindingOptions, IHostBindingOptionsStrict } from './types';
import { NormalizeTemplateBuildOptions } from '../../template/helpers';

/** FUNCTIONS **/

export function NormalizeHostBindingOptions(options: IHostBindingOptions): IHostBindingOptionsStrict {
  return NormalizeTemplateBuildOptions(options);
}
