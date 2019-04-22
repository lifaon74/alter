import { IBindDirectiveGenerator, IBindDirectiveGeneratorOptions } from './interfaces';
import { BindGenerator } from '../implementation';

/**
 * Generator for a directive.
 */
export abstract class BindDirectiveGenerator extends BindGenerator implements IBindDirectiveGenerator {
  protected constructor(options: IBindDirectiveGeneratorOptions) {
    super(options);
  }
}
