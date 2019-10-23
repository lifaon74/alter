import { BindGenerator } from '../implementation';
import { IBindPropertyGenerator, IBindPropertyOptions } from './interfaces';


/**
 * Generator for a bind property.
 * ex: [href]
 */
export class BindPropertyGenerator extends BindGenerator implements IBindPropertyGenerator {
  constructor(options: IBindPropertyOptions) {
    super(options);
  }

  generate(): string[] {
    return [
      `// bind property '${this.name}'`,
      `new DynamicProperty(node, ${JSON.stringify(this.name)}).observe(${this.observableValue});`,
    ];
  }
}
