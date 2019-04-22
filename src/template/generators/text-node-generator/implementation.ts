import { ITextNodeGenerator } from './interfaces';
import { CodeGenerator } from '../code-generator/implementation';

export abstract class TextNodeGenerator extends CodeGenerator implements ITextNodeGenerator {
  public readonly value: string;

  protected constructor(value: string) {
    super();
    this.value = value;
  }
}
