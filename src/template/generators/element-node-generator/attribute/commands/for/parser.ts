import { IForCommandGenerator } from './interfaces';
import { ForCommandGenerator } from './implementation';
import { IModuleCommand } from '../interfaces';
import { TAttributeGeneratorModifiers } from '../../interfaces';

const selector: RegExp = new RegExp('^for$');

const letOfPattern: string = 'let\\s+(\\S.*)\\s+of\\s+(\\S.*)';
const variableAsPattern: string = '(\\S.*)\\s+as\\s+(\\S.*)';
const variableLetPattern: string = 'let\\s+(\\S.*)\\s+=\\s+(\\S.*)';

const letOfRegExp: RegExp = new RegExp(`^${letOfPattern}$`);
const variableAsRegExp: RegExp = new RegExp(`^${variableAsPattern}$`);
const variableLetRegExp: RegExp = new RegExp(`^${variableLetPattern}$`);

const localVariableNames: Set<string> = new Set(['index']);

export function GenerateInvalidSyntaxError(expression: string, message: string): Error {
  return new Error(`Invalid syntax in the 'for' command '${expression}': ${message}`);
}

export function TestVariableNameOrThrow(variableName: string, expression: string): void {
  try {
    eval(`var ${variableName} = 1`);
  } catch (e) {
    throw GenerateInvalidSyntaxError(expression, `invalid variable name '${variableName}'`);
  }
}

export function SetLocalVariableMapping(localVariableNamesMap: Map<string, string>, localVariableName: string, localVariableNameMapped: string, expression: string): void {
  TestVariableNameOrThrow(localVariableNameMapped, expression);

  if (localVariableNames.has(localVariableName)) {
    if (localVariableNamesMap.has(localVariableName)) {
      throw GenerateInvalidSyntaxError(
        expression,
        `local variable '${localVariableName}' already mapped to '${localVariableNamesMap.get(localVariableName)}'`
      );
    } else {
      localVariableNamesMap.set(localVariableName, localVariableNameMapped);
    }
  } else {
    throw GenerateInvalidSyntaxError(
      expression,
      `invalid local variable '${localVariableName}'. Available: ${Array.from(localVariableNames).join(', ')}`
    );
  }
}


export function parseForCommandAttribute<T extends IForCommandGenerator>(name: string, value: string, modifiers: Set<TAttributeGeneratorModifiers>): T | null {
  if (selector.test(name)) {
    const localVariableNamesMap: Map<string, string> = new Map<string, string>();
    let iterableName: string;
    let iterableEntryName: string;

    const expressions: string[] = value.split(';').map(_ => _.trim()).filter(_ => (_ !== ''));

    const length: number = expressions.length;
    if (length === 0) {
      throw GenerateInvalidSyntaxError(value, 'missing iterable');
    } else {
      const match: RegExpExecArray | null = letOfRegExp.exec(expressions[0]);
      if (match === null) {
        throw GenerateInvalidSyntaxError(value, `invalid 'let ... of ...' syntax`);
      } else {
        TestVariableNameOrThrow(match[1], value);
        iterableEntryName = match[1];
        iterableName = match[2];
      }
    }

    for (let i = 1; i < length; i++) {
      const expression: string = expressions[i];
      let match: RegExpExecArray | null;
      if ((match = variableAsRegExp.exec(expression)) !== null) {
        SetLocalVariableMapping(localVariableNamesMap, match[1], match[2], value);
      } else if ((match = variableLetRegExp.exec(expression)) !== null) {
        SetLocalVariableMapping(localVariableNamesMap, match[2], match[1], value);
      } else {
        throw GenerateInvalidSyntaxError(value, `unknown expression '${expression}'`);
      }
    }

    return new ForCommandGenerator({ name, value, modifiers, priority: 100, localVariableNamesMap, iterableName, iterableEntryName }) as any;
  } else {
    return null;
  }
}

export const ModuleForCommand: IModuleCommand = {
  parse: parseForCommandAttribute,
};
