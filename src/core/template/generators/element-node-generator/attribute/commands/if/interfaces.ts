import { ICommandGenerator, ICommandGeneratorConstructor, ICommandGeneratorOptions } from '../interfaces';


export interface IIfCommandGeneratorOptions extends ICommandGeneratorOptions {
}

export interface IIfCommandGeneratorConstructor extends ICommandGeneratorConstructor {
  new(options: IIfCommandGeneratorOptions): IIfCommandGenerator;
}

export interface IIfCommandGenerator extends ICommandGenerator {
}
