import { ICodeGenerator } from '../code-generator/interfaces';

export interface ITextNodeGeneratorConstructor {
  new(value: string): ITextNodeGenerator;
}

export interface ITextNodeGenerator extends ICodeGenerator {
  readonly value: string;
}

export type TTextNodeGeneratorModifiers = 'expression';
