import { IAttributeGenerator, IAttributeGeneratorOptions, TAttributeGeneratorModifiers } from './interfaces';
import { CodeGenerator } from '../../code-generator/implementation';

/**
 * Generator for an attribute
 */
export abstract class AttributeGenerator extends CodeGenerator implements IAttributeGenerator {
  public readonly name: string;
  public readonly value: string;
  public readonly modifiers: Set<TAttributeGeneratorModifiers>;

  protected constructor(options: IAttributeGeneratorOptions) {
    super();
    this.name = options.name;
    this.value = options.value;
    if (options.modifiers === void 0) {
      this.modifiers = new Set<TAttributeGeneratorModifiers>();
    } else if (options.modifiers instanceof Set) {
      this.modifiers = options.modifiers;
    } else {
      throw new TypeError(`Expected Set as options.modifiers`);
    }
  }
}
