import { ISwitchCaseCommandGenerator, ISwitchCaseCommandGeneratorOptions, } from './interfaces';
import { SwitchChildCommandGenerator } from '../child/implementation';


export class SwitchCaseCommandGenerator extends SwitchChildCommandGenerator implements ISwitchCaseCommandGenerator {
  constructor(options: ISwitchCaseCommandGeneratorOptions) {
    super(options);
  }

  get observableComposedValue(): string {
    return `$equal(${ this.observableValue }, ${ this.observableParentValue })`;
  }
}

