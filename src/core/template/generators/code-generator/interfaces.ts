export interface ICodeGeneratorConstructor {
}

/**
 * A CodeGenerator is a class implementing a 'generate' function which returns a list of lines.
 */
export interface ICodeGenerator {
  generate(options?: ICodeGeneratorOptions): string[];
}

export interface ICodeGeneratorOptions {
}
