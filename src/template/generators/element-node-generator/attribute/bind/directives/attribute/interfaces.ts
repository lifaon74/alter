import { IBindDirectiveGenerator, IBindDirectiveGeneratorConstructor, IBindDirectiveGeneratorOptions } from '../interfaces';


export interface IBindAttributeDirectiveGeneratorOptions extends IBindDirectiveGeneratorOptions {
  propertyName: string;
}

export interface IBindAttributeDirectiveGeneratorConstructor extends IBindDirectiveGeneratorConstructor {
  new(options: IBindAttributeDirectiveGeneratorOptions): IBindAttributeDirectiveGenerator;
}

export interface IBindAttributeDirectiveGenerator extends IBindDirectiveGenerator {
  propertyName: string;
}

