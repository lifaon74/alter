import {  ISwitchChildCommandGenerator, ISwitchChildCommandGeneratorOptions } from './interfaces';
import { CommandGenerator } from '../../implementation';
import { TAttributeGeneratorModifiers } from '../../../interfaces';
import { IndentLines, ValueToObservableCode } from '../../../../../snipets';
import { ICommandCodeGeneratorOptions } from '../../interfaces';


export abstract class SwitchChildCommandGenerator extends CommandGenerator implements ISwitchChildCommandGenerator {
  readonly parentSwitchValue: string;
  readonly parentSwitchModifiers: Set<TAttributeGeneratorModifiers>;
  abstract readonly observableComposedValue: string;

  protected constructor(options: ISwitchChildCommandGeneratorOptions) {
    super(options);
    this.parentSwitchValue = options.parentSwitchValue;
    this.parentSwitchModifiers = options.parentSwitchModifiers;
  }

  get observableParentValue(): string {
    return ValueToObservableCode(this.parentSwitchValue, this.parentSwitchModifiers.has('expression'));
  }

  generate(options: ICommandCodeGeneratorOptions): string[] {
    return [
      `// command '${ this.name }'`,
      `const node = new DynamicConditionalNode(() => {`,
      ...IndentLines([
        ...options.createNode,
        `return node;`,
      ]),
      `}).observe(${ this.observableComposedValue });`,
    ];
  }
}

