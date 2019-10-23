import { ICodeGenerator, ICodeGeneratorConstructor } from '../code-generator/interfaces';

export interface ITemplateGeneratorConstructor extends ICodeGeneratorConstructor {
}

export interface ITemplateGenerator extends ICodeGenerator {
  generate(constantsToImport?: Set<string>): string[];
}


