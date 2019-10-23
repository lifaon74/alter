import { IBindGenerator, IBindGeneratorConstructor, IBindGeneratorOptions } from '../interfaces';
import { TAttributeGeneratorModifiers } from '../../interfaces';

export interface  IBindDirectiveGeneratorOptions extends IBindGeneratorOptions {
}

export interface IBindDirectiveGeneratorConstructor extends IBindGeneratorConstructor {
  new(options: IBindDirectiveGeneratorOptions): IBindDirectiveGenerator;
}

export interface IBindDirectiveGenerator extends IBindGenerator {
}

export interface IBindDirectiveParser {
  parse(name: string, value: string, modifiers?: Set<TAttributeGeneratorModifiers>): IBindDirectiveGenerator | null;
}
