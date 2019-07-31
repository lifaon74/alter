import { ICommandGenerator, ICommandGeneratorOptions } from './interfaces';
import { AttributeGenerator } from '../implementation';
import { ValueToObservableCode } from '../../../snipets';


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

  get observableValue(): string {
    return ValueToObservableCode(this.value, this.modifiers.has('expression'));
  }
}

export function IsCommandGenerator(value: any): value is ICommandGenerator {
  return value instanceof CommandGenerator;
}


