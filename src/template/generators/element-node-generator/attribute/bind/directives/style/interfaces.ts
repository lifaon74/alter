import { IBindDirectiveGenerator, IBindDirectiveGeneratorConstructor, IBindDirectiveGeneratorOptions } from '../interfaces';


export interface IBindStyleDirectiveGeneratorOptions extends IBindDirectiveGeneratorOptions {
  propertyName: string;
}

export interface IBindStyleDirectiveGeneratorConstructor extends IBindDirectiveGeneratorConstructor {
  new(options: IBindStyleDirectiveGeneratorOptions): IBindStyleDirectiveGenerator;
}

export interface IBindStyleDirectiveGenerator extends IBindDirectiveGenerator {
  propertyName: string;
}

