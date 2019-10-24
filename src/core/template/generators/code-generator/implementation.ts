import { ICodeGenerator, ICodeGeneratorOptions } from './interfaces';

export abstract class CodeGenerator implements ICodeGenerator {
  abstract generate(options?: ICodeGeneratorOptions): string[];
}
