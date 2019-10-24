import { IBindStyleDirectiveGenerator } from './interfaces';
import { BindStyleDirectiveGenerator } from './implementation';
import { IBindDirectiveParser } from '../interfaces';
import { TAttributeGeneratorModifiers } from '../../../interfaces';

const standardSelector: RegExp = new RegExp('^style\\.(.*)$');
const prefixSelector: RegExp = new RegExp('^style-(.*)');

export function parseBindStyleDirective<T extends IBindStyleDirectiveGenerator>(name: string, value: string, modifiers: Set<TAttributeGeneratorModifiers>): T | null {
  const prefixMode: boolean = modifiers.has('prefix');
  const match: RegExpExecArray | null = prefixMode
    ? prefixSelector.exec(name)
    : standardSelector.exec(name);

  if (match === null) {
    return null;
  } else {
    let propertyName: string = match[1];

    if (prefixMode ? (propertyName === '--') : (propertyName === '..')) {
      propertyName = '..';
    }

    return new BindStyleDirectiveGenerator({ name, value, propertyName: propertyName, modifiers }) as any;
  }
}

export const BindStyleDirectiveParser: IBindDirectiveParser = {
  parse: parseBindStyleDirective,
};
