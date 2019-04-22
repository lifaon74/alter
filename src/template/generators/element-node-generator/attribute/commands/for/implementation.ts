import { ForCommandGeneratorOptions, IForCommandGenerator, IForCommandGeneratorOptions } from './interfaces';
import { CommandGenerator } from '../implementation';
import { IndentLines, ValueToObservableCode } from '../../../../snipets';


export class ForCommandGenerator extends CommandGenerator implements IForCommandGenerator {

  public readonly iterableName: string;
  public readonly iterableEntryName: string;
  public readonly localVariableNamesMap: Map<string, string>;

  constructor(options: IForCommandGeneratorOptions) {
    super(options);
    this.iterableName = options.iterableName;
    this.iterableEntryName = options.iterableEntryName;
    this.localVariableNamesMap = options.localVariableNamesMap;
  }

  get observableValue(): string {
    return ValueToObservableCode(this.iterableName, this.modifiers.has('expression'));
  }

  generate(options: ForCommandGeneratorOptions): string[] {
    return [
      `// command '${this.name}'`,
      `const node = new DynamicForLoopNode((${this.iterableEntryName}, ${this._getLocalVariableName('index')}) => {`,
      ...IndentLines([
        ...options.createNode,
        `return node;`,
      ]),
      `}).observe(${this.observableValue});`,
    ];
  }

  protected _getLocalVariableName(key: string): string {
    return this.localVariableNamesMap.has(key)
      ? this.localVariableNamesMap.get(key)
      : key;
  }
}

