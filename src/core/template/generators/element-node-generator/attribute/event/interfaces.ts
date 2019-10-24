import { IAttributeGenerator, IAttributeGeneratorConstructor, IAttributeGeneratorOptions } from '../interfaces';

export interface IEventListenerGeneratorOptions extends IAttributeGeneratorOptions {
}

export interface IEventListenerGeneratorConstructor extends IAttributeGeneratorConstructor {
  new(options: IEventListenerGeneratorOptions): IEventListenerGenerator;
}

export interface IEventListenerGenerator extends IAttributeGenerator {
  readonly observerValue: string;
}
