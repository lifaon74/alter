import { IStaticAttributeGenerator, IStaticAttributeGeneratorOptions } from './interfaces';
import { AttributeGenerator } from '../implementation';

/**
 * Generator for a static attribute
 */
export class StaticAttributeGenerator extends AttributeGenerator implements IStaticAttributeGenerator {
  constructor(options: IStaticAttributeGeneratorOptions) {
    super(options);
  }

  generate(): string[] {
    return [
      `// static attribute '${ this.name }'`,
      `node.setAttribute(${ JSON.stringify(this.name) }, ${ JSON.stringify(this.value) });`,
    ];
  }
}
