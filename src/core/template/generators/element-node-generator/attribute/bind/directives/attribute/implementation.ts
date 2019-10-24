import { IBindAttributeDirectiveGenerator, IBindAttributeDirectiveGeneratorOptions } from './interfaces';
import { BindDirectiveGenerator } from '../implementation';


/**
 * Generator for a class directive.
 * Syntax:
 *  - standard:
 *    [attr.my-attr]="'attr-value'"
 *    [attr...]="{ 'my-attr': 'attr-value' }"
 *
 *  - prefixed:
 *    bind-attr-my-attr="'attr-value'"
 *    bind-attr---="{ 'my-attr': 'attr-value' }"
 */
export class BindAttributeDirectiveGenerator extends BindDirectiveGenerator implements IBindAttributeDirectiveGenerator {
  public readonly propertyName: string;

  constructor(options: IBindAttributeDirectiveGeneratorOptions) {
    super(options);
    this.propertyName = options.propertyName;
  }

  isSpreadAttribute(): boolean {
    return (this.propertyName === '..');
  }

  generate(): string[] {
    if (this.isSpreadAttribute()) {
      throw 'TODO';
      // return [
      //   `// bind directive '${this.name}'`,
      //   `new DynamicAttributeList(node).observe(${this.observableValue});`,
      // ];
    } else {
      return [
        `// bind directive '${ this.name }'`,
        `new DynamicAttribute(node, ${ JSON.stringify(this.propertyName) }).observe(${ this.observableValue });`,
      ];
    }
  }
}
