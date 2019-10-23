import { IBindDirectiveGenerator, IBindDirectiveGeneratorConstructor, IBindDirectiveGeneratorOptions } from '../interfaces';


export interface  IBindClassDirectiveGeneratorOptions extends IBindDirectiveGeneratorOptions {
  className: string;
}

export interface IBindClassDirectiveGeneratorConstructor extends IBindDirectiveGeneratorConstructor {
  new(options: IBindClassDirectiveGeneratorOptions): IBindClassDirectiveGenerator;
}

export interface IBindClassDirectiveGenerator extends IBindDirectiveGenerator {
  className: string;
}

