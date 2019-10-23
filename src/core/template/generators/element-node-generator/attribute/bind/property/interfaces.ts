import { IBindGenerator, IBindGeneratorConstructor, IBindGeneratorOptions } from '../interfaces';

export interface IBindPropertyOptions extends IBindGeneratorOptions {
}

export interface IBindPropertyGeneratorConstructor extends IBindGeneratorConstructor {
  new(options: IBindPropertyOptions): IBindPropertyGenerator;
}

export interface IBindPropertyGenerator extends IBindGenerator {
}
