import { ICommandGenerator, ICommandGeneratorConstructor, ICommandGeneratorOptions } from '../interfaces';
import { ICodeGeneratorOptions } from '../../../../code-generator/interfaces';


export interface IIfCommandGeneratorOptions extends ICommandGeneratorOptions {
}

export interface IIfCommandGeneratorConstructor extends ICommandGeneratorConstructor {
  new(options: IIfCommandGeneratorOptions): IIfCommandGenerator;
}

export interface IIfCommandGenerator extends ICommandGenerator {
  readonly observableValue: string;
  generate(options: IfCommandGeneratorOptions): string[];
}

export interface IfCommandGeneratorOptions extends ICodeGeneratorOptions {
  createNode: string[];
}