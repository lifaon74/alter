import { IfCommandGeneratorOptions, IIfCommandGenerator, IIfCommandGeneratorOptions } from './interfaces';
import { CommandGenerator } from '../implementation';
import { IndentLines, ValueToObservableCode } from '../../../../snipets';


export class IfCommandGenerator extends CommandGenerator implements IIfCommandGenerator {
  constructor(options: IIfCommandGeneratorOptions) {
    super(options);
  }

  get observableValue(): string {
    return ValueToObservableCode(this.value, this.modifiers.has('expression'));
  }

  generate(options: IfCommandGeneratorOptions): string[] {
    return [
      `// command '${this.name}'`,
      `const node = new DynamicConditionalNode(() => {`,
      ...IndentLines([
        ...options.createNode,
        `return node;`,
      ]),
      `}).observe(${this.observableValue});`,
    ];
  }
}

