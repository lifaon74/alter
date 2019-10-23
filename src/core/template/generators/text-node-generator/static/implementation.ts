import { TextNodeGenerator } from '../implementation';
import { IStaticTextNodeGenerator } from './interfaces';

/**
 * Represents a static text node in the template.
 */
export class StaticTextNodeGenerator extends TextNodeGenerator implements IStaticTextNodeGenerator {
  constructor(value: string) {
    super(value);
  }

  generate(): string[] {
    return [
      `// static text node`,
      `AttachNode(document.createTextNode(${JSON.stringify(this.value)}), parentNode);`,
    ];
  }
}
