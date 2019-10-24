import { ICommandGenerator, ICommandGeneratorConstructor, ICommandGeneratorOptions } from '../../interfaces';
import { TAttributeGeneratorModifiers } from '../../../interfaces';


export interface ISwitchChildCommandGeneratorOptions extends ICommandGeneratorOptions {
  parentSwitchValue: string;
  parentSwitchModifiers: Set<TAttributeGeneratorModifiers>;
}

export interface ISwitchChildCommandGeneratorConstructor extends ICommandGeneratorConstructor {
  new(options: ISwitchChildCommandGeneratorOptions): ISwitchChildCommandGenerator;
}

export interface ISwitchChildCommandGenerator extends ICommandGenerator {
  readonly parentSwitchValue: string;
  readonly parentSwitchModifiers: Set<TAttributeGeneratorModifiers>;
  readonly observableParentValue: string;
  readonly observableComposedValue: string;
}
