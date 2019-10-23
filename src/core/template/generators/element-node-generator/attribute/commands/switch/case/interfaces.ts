import {
  ISwitchChildCommandGenerator, ISwitchChildCommandGeneratorConstructor, ISwitchChildCommandGeneratorOptions
} from '../child/interfaces';


export interface ISwitchCaseCommandGeneratorOptions extends ISwitchChildCommandGeneratorOptions {
}

export interface ISwitchCaseCommandGeneratorConstructor extends ISwitchChildCommandGeneratorConstructor {
  new(options: ISwitchCaseCommandGeneratorOptions): ISwitchCaseCommandGenerator;
}

export interface ISwitchCaseCommandGenerator extends ISwitchChildCommandGenerator {
}
