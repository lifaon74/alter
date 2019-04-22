import { IAttributeGenerator, IAttributeGeneratorConstructor, IAttributeGeneratorOptions, TAttributeGeneratorModifiers } from '../interfaces';

export interface ICommandGeneratorOptions extends IAttributeGeneratorOptions {
  priority: number;
}

export interface ICommandGeneratorConstructor extends IAttributeGeneratorConstructor {
  new(options: ICommandGeneratorOptions): ICommandGenerator;
}

export interface ICommandGenerator extends IAttributeGenerator {
  readonly priority: number;
}

export interface IModuleCommand {
  parse(name: string, value: string, modifiers?: Set<TAttributeGeneratorModifiers>): ICommandGenerator | null;
}
