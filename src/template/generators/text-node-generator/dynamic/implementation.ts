import { TextNodeGenerator } from '../implementation';
import { IDynamicTextNodeGenerator} from './interfaces';
import { ValueToObservableCode } from '../../snipets';
import { TTextNodeGeneratorModifiers } from '../interfaces';

/**
 * Represents a dynamic text node in the template.
 */
export class DynamicTextNodeGenerator extends TextNodeGenerator implements IDynamicTextNodeGenerator {
  public readonly modifiers: Set<TTextNodeGeneratorModifiers>;

  constructor(value: string, modifiers?: Set<TTextNodeGeneratorModifiers>) {
    super(value);
    if (modifiers === void 0) {
      this.modifiers = new Set<TTextNodeGeneratorModifiers>();
    } else if (modifiers instanceof Set) {
      this.modifiers = modifiers;
    } else {
      throw new TypeError(`Expected Set as modifiers`);
    }
  }

  get observableValue(): string {
    return ValueToObservableCode(this.value, this.modifiers.has('expression'));
  }

  generate(): string[] {
    return [
      `// dynamic text node`,
      `AttachNode(new DynamicTextNode().observe(${this.observableValue}), parentNode);`,
    ];
  }
}
