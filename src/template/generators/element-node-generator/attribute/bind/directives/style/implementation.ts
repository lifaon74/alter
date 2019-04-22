import { IBindStyleDirectiveGenerator, IBindStyleDirectiveGeneratorOptions } from './interfaces';
import { BindDirectiveGenerator } from '../implementation';



/**
 * Generator for a class directive.
 * Syntax:
 *  - standard:
 *    [style.font-size]="'12px'"
 *    [style...]="{ color: 'blue' }"
 *
 *  - prefixed:
 *    bind-style-font-size="'12px'"
 *    bind-style---="{ color: 'blue' }"
 */
export class BindStyleDirectiveGenerator extends BindDirectiveGenerator implements IBindStyleDirectiveGenerator {
  public readonly propertyName: string;

  constructor(options: IBindStyleDirectiveGeneratorOptions) {
    super(options);
    this.propertyName = options.propertyName;
  }

  isSpreadStyle(): boolean {
    return (this.propertyName === '..');
  }

  generate(): string[] {
    if (this.isSpreadStyle()) {
      return [
        `// bind directive '${this.name}'`,
        `new DynamicStyleList(node).observe(${this.observableValue});`,
      ];
    } else {
      return [
        `// bind directive '${this.name}'`,
        `new DynamicStyle(node, ${JSON.stringify(this.propertyName)}).observe(${this.observableValue});`,
      ];
    }
  }
}
