import { IIfCommandGenerator } from './interfaces';
import { IfCommandGenerator } from './implementation';
import { ICommandAttribute, ICommandParser } from '../interfaces';

export const ifSelector: RegExp = new RegExp('^if(?:-((?:\\d+)|(?:cache)))?$');

export function parseIfCommandAttribute({ name, value, modifiers }: ICommandAttribute): IIfCommandGenerator | null {
  const match: RegExpExecArray | null = ifSelector.exec(name);
  if (match === null) {
    return null;
  } else {
    const ifOption: string = match[1];
    let destroyTimeout: number;
    if (ifOption === void 0) {
      destroyTimeout = 0;
    } else if (ifOption === 'cache') {
      destroyTimeout = -1;
    } else {
      destroyTimeout = parseInt(ifOption, 10);
    }
    return new IfCommandGenerator({ name, value, modifiers, priority: 300, destroyTimeout });
  }
}

export const IfCommandParser: ICommandParser = {
  parse: parseIfCommandAttribute,
};
