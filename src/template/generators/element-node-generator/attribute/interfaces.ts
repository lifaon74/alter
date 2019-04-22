import { ICodeGenerator, ICodeGeneratorConstructor } from '../../code-generator/interfaces';

export interface IAttributeGeneratorOptions {
  name: string;
  value: string;
  modifiers?: Set<TAttributeGeneratorModifiers>;
}

export interface IAttributeGeneratorConstructor extends ICodeGeneratorConstructor {
  new(options: IAttributeGeneratorOptions): IAttributeGenerator;
}

export interface IAttributeGenerator extends ICodeGenerator {
  readonly name: string;
  readonly value: string;
  readonly modifiers: Set<TAttributeGeneratorModifiers>;
}

export type TAttributeGeneratorModifiers = 'prefix' | 'expression';
