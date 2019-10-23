import { IBindGenerator, IBindGeneratorOptions } from './interfaces';
import { AttributeGenerator } from '../implementation';
import { ValueToObservableCode } from '../../../snipets';


/**
 * Generator for a bind attribute:
 * Syntax:
 *  - standard: [property]
 *  - prefixed: bind-property
 */
export abstract class BindGenerator extends AttributeGenerator implements IBindGenerator {
  protected constructor(options: IBindGeneratorOptions) {
    super(options);
  }

  get observableValue(): string {
    return ValueToObservableCode(this.value, this.modifiers.has('expression'));
  }
}

