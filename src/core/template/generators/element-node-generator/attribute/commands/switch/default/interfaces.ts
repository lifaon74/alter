import {
  ISwitchChildCommandGenerator, ISwitchChildCommandGeneratorConstructor, ISwitchChildCommandGeneratorOptions
} from '../child/interfaces';
import { ICommandAttribute } from '../../interfaces';


export interface ISwitchDefaultCommandGeneratorOptions extends ISwitchChildCommandGeneratorOptions {
  switchCases: ICommandAttribute[];
}

export interface ISwitchDefaultCommandGeneratorConstructor extends ISwitchChildCommandGeneratorConstructor {
  new(options: ISwitchDefaultCommandGeneratorOptions): ISwitchDefaultCommandGenerator;
}

export interface ISwitchDefaultCommandGenerator extends ISwitchChildCommandGenerator {
  readonly switchCases: ReadonlyArray<ICommandAttribute>;
}
