import { IAttributeGenerator, IAttributeGeneratorConstructor, IAttributeGeneratorOptions, TAttributeGeneratorModifiers } from '../interfaces';
import { ICodeGeneratorOptions } from '../../../code-generator/interfaces';

export interface ICommandGeneratorOptions extends IAttributeGeneratorOptions {
  priority: number; // high priority means processed first
}

export interface ICommandGeneratorConstructor extends IAttributeGeneratorConstructor {
  new(options: ICommandGeneratorOptions): ICommandGenerator;
}

export interface ICommandGenerator extends IAttributeGenerator {
  readonly priority: number;
  readonly observableValue: string;

  generate(options: ICommandCodeGeneratorOptions): string[];
}


export interface ICommandCodeGeneratorOptions extends ICodeGeneratorOptions {
  createNode: string[];
}

/*---*/


export interface ICommandAttribute {
  name: string;
  value: string;
  modifiers?: Set<TAttributeGeneratorModifiers>;
  attribute?: Attr;
}

export interface ICommandParser {
  parse(commandAttribute: ICommandAttribute): ICommandGenerator | null;
}
