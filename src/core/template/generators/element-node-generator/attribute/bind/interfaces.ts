import { IAttributeGenerator, IAttributeGeneratorConstructor, IAttributeGeneratorOptions } from '../interfaces';

export interface IBindGeneratorOptions extends IAttributeGeneratorOptions {
}

export interface IBindGeneratorConstructor extends IAttributeGeneratorConstructor {
  new(options: IBindGeneratorOptions): IBindGenerator;
}

export interface IBindGenerator extends IAttributeGenerator {
  readonly observableValue: string;
}
