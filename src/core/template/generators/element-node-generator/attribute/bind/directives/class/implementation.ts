import { IBindClassDirectiveGenerator, IBindClassDirectiveGeneratorOptions } from './interfaces';
import { BindDirectiveGenerator } from '../implementation';


/**
 * Generator for a class directive.
 * Syntax:
 *  - standard:
 *    [class.class-a]="boolean"
 *    [class...]="['class-a', 'class-b']"
 *
 *  - prefixed:
 *    bind-class-class-a="boolean"
 *    bind-class---="['class-a', 'class-b']"
 */
export class BindClassDirectiveGenerator extends BindDirectiveGenerator implements IBindClassDirectiveGenerator {
  public readonly className: string;

  constructor(options: IBindClassDirectiveGeneratorOptions) {
    super(options);
    this.className = options.className;
  }

  isSpreadClass(): boolean {
    return (this.className === '..');
  }

  generate(): string[] {
    if (this.isSpreadClass()) {
      return [
        `// bind directive '${this.name}'`,
        `new DynamicClassList(node).observe(${this.observableValue});`,
      ];
    } else {
      return [
        `// bind directive '${this.name}'`,
        `new DynamicClass(node, ${JSON.stringify(this.className)}).observe(${this.observableValue});`,
      ];
    }
  }
}
