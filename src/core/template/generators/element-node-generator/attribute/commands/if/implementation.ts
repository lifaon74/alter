import { IIfCommandGenerator, IIfCommandGeneratorOptions } from './interfaces';
import { CommandGenerator } from '../implementation';
import { IndentLines } from '../../../../snipets';
import { ICommandCodeGeneratorOptions } from '../interfaces';


export class IfCommandGenerator extends CommandGenerator implements IIfCommandGenerator {
  constructor(options: IIfCommandGeneratorOptions) {
    super(options);
  }

  generate(options: ICommandCodeGeneratorOptions): string[] {
    return [
      `// command '${ this.name }'`,
      `const node = new DynamicConditionalNode(() => {`,
      ...IndentLines([
        ...options.createNode,
        `return node;`,
      ]),
      `}).observe(${ this.observableValue });`,
    ];
  }
}

