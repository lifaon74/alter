import { ICommandGenerator, ICommandGeneratorConstructor, ICommandGeneratorOptions } from '../interfaces';

/**
 * @example:
 * let <localVariableNamesMap>.get('index')>; // the index
 * for (const <iterableEntryName> of <iterableName>) {
 *    // CODE HERE
 *   <localVariableNamesMap>.get('index')>++;
 * }
 *
 * @data {
 *   iterableName: 'items',
 *   iterableEntryName: 'item',
 *   localVariableNamesMap: new Map([['index', 'i']]),
 * }
 *
 * @output
 * let i;
 * for (const item of items) {
 *    // CODE HERE
 *   i++;
 * }
 */
export interface IForCommandGeneratorOptions extends ICommandGeneratorOptions {
  iterableName: string; // name of the iterable to iterate over
  iterableEntryName: string; // name of the variable of the result of iterable.next().value
  localVariableNamesMap: Map<string, string>; // map from a locale variable (ex: index) to the name in the for loop
}

export interface IForCommandGeneratorConstructor extends ICommandGeneratorConstructor {
  new(options: IForCommandGeneratorOptions): IForCommandGenerator;
}

export interface IForCommandGenerator extends ICommandGenerator {
  readonly iterableName: string;
  readonly iterableEntryName: string;
  readonly localVariableNamesMap: Map<string, string>;
}

