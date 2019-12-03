import { ISwitchDefaultCommandGenerator, ISwitchDefaultCommandGeneratorOptions, } from './interfaces';
import { SwitchChildCommandGenerator } from '../child/implementation';
import { ICommandAttribute } from '../../interfaces';
import { ValueToObservableCode } from '../../../../../snipets';


export class SwitchDefaultCommandGenerator extends SwitchChildCommandGenerator implements ISwitchDefaultCommandGenerator {
  readonly switchCases: ReadonlyArray<ICommandAttribute>;

  constructor(options: ISwitchDefaultCommandGeneratorOptions) {
    super(options);
    this.switchCases = Object.freeze(options.switchCases);
  }


  get observableComposedValue(): string {
    const observables: string[] = this.switchCases.map((commandAttribute: ICommandAttribute) => {
      return `$notEqual(${ ValueToObservableCode(commandAttribute.value, commandAttribute.modifiers.has('expression')) }, ${ this.observableParentValue })`;
    });
    return (observables.length === 0)
      ? ValueToObservableCode('true', false)
      : (observables.length === 1)
        ? observables[0]
        : `$and(${ observables.join(', ') })`;
  }
}

