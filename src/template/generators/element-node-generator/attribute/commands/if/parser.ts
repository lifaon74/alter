import { IIfCommandGenerator } from './interfaces';
import { IfCommandGenerator } from './implementation';
import { IModuleCommand } from '../interfaces';
import { TAttributeGeneratorModifiers } from '../../interfaces';

const selector: RegExp = new RegExp('^if$');

export function parseIfCommandAttribute<T extends IIfCommandGenerator>(name: string, value: string, modifiers?: Set<TAttributeGeneratorModifiers>): T | null {
  if (selector.test(name)) {
    return new IfCommandGenerator({ name, value, modifiers, priority: 200 }) as T;
  } else {
    return null;
  }
}

export const ModuleIfCommand: IModuleCommand = {
  parse: parseIfCommandAttribute,
};
