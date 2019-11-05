import { IIfCommandGenerator, IIfCommandGeneratorOptions } from './interfaces';
import { CommandGenerator } from '../implementation';
import { IndentLines } from '../../../../snipets';
import { ICommandCodeGeneratorOptions } from '../interfaces';


export class IfCommandGenerator extends CommandGenerator implements IIfCommandGenerator {
  readonly destroyTimeout: number | undefined;

  constructor(options: IIfCommandGeneratorOptions) {
    super(options);
    this.destroyTimeout = options.destroyTimeout;
  }

  get options(): string {
    return (this.destroyTimeout === void 0)
      ? 'void 0'
      : `{ destroyTimeout: ${ this.destroyTimeout } }`;
  }

  generate(options: ICommandCodeGeneratorOptions): string[] {
    return [
      `// command '${ this.name }'`,
      `const node = new DynamicConditionalNode(() => {`,
      ...IndentLines([
        ...options.createNode,
        `return node;`,
      ]),
      `}, ${ this.options }).observe(${ this.observableValue });`,
    ];
  }
}

