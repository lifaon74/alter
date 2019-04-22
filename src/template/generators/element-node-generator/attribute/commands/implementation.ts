import { ICommandGenerator, ICommandGeneratorOptions } from './interfaces';
import { AttributeGenerator } from '../implementation';


/**
 * Generator for a command attribute:
 * Syntax:
 *  - standard: *attribute
 *  - prefixed: cmd-attribute?
 */
export abstract class CommandGenerator extends AttributeGenerator implements ICommandGenerator {
  readonly priority: number;

  protected constructor(options: ICommandGeneratorOptions) {
    super(options);
    this.priority = options.priority;
  }
}

