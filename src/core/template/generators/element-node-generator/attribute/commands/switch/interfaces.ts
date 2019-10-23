import { ICommandGenerator, ICommandGeneratorConstructor, ICommandGeneratorOptions } from '../interfaces';

export interface ISwitchCommandGeneratorOptions extends ICommandGeneratorOptions {
}

export interface ISwitchCommandGeneratorConstructor extends ICommandGeneratorConstructor {
  new(options: ISwitchCommandGeneratorOptions): ISwitchCommandGenerator;
}

export interface ISwitchCommandGenerator extends ICommandGenerator {
}
