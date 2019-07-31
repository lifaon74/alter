import { IIfCommandGenerator } from './interfaces';
import { IfCommandGenerator } from './implementation';
import { ICommandAttribute, ICommandParser } from '../interfaces';

export const ifSelector: RegExp = new RegExp('^if$');

export function parseIfCommandAttribute({ name, value, modifiers }: ICommandAttribute): IIfCommandGenerator | null {
  if (ifSelector.test(name)) {
    return new IfCommandGenerator({ name, value, modifiers, priority: 300 });
  } else {
    return null;
  }
}

export const IfCommandParser: ICommandParser = {
  parse: parseIfCommandAttribute,
};
