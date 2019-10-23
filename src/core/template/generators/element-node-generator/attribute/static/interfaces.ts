import { IAttributeGenerator, IAttributeGeneratorConstructor, IAttributeGeneratorOptions } from '../interfaces';

export interface IStaticAttributeGeneratorOptions extends IAttributeGeneratorOptions {
}

export interface IStaticAttributeGeneratorConstructor extends IAttributeGeneratorConstructor {
  new(options: IStaticAttributeGeneratorOptions): IStaticAttributeGenerator;
}

export interface IStaticAttributeGenerator extends IAttributeGenerator {
}