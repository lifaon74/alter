import { ISwitchCommandGenerator, ISwitchCommandGeneratorOptions } from './interfaces';
import { CommandGenerator } from '../implementation';
import { ScopeLines } from '../../../../snipets';
import { ICommandCodeGeneratorOptions } from '../interfaces';


export class SwitchCommandGenerator extends CommandGenerator implements ISwitchCommandGenerator {
  constructor(options: ISwitchCommandGeneratorOptions) {
    super(options);
  }

  generate(options: ICommandCodeGeneratorOptions): string[] {
    return [
      `// command '${ this.name }'`,
      `const node = new ContainerNode('SWITCH');`,
      `const switchNode = node;`,
      ...ScopeLines([
        ...options.createNode,
        `AttachNode(node, switchNode);`,
      ]),
    ];
  }
}

