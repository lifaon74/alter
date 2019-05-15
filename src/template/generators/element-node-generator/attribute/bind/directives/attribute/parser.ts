import { IBindAttributeDirectiveGenerator } from './interfaces';
import { BindAttributeDirectiveGenerator } from './implementation';
import { IBindDirectiveParser } from '../interfaces';
import { TAttributeGeneratorModifiers } from '../../../interfaces';

const standardSelector: RegExp = new RegExp('^attr\\.(.*)$');
const prefixSelector: RegExp = new RegExp('^attr-(.*)');

export function parseBindAttributeDirective<T extends IBindAttributeDirectiveGenerator>(name: string, value: string, modifiers: Set<TAttributeGeneratorModifiers>): T | null {
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

    return new BindAttributeDirectiveGenerator({ name, value, propertyName: propertyName, modifiers }) as any;
  }
}

export const BindAttributeDirectiveParser: IBindDirectiveParser = {
 parse: parseBindAttributeDirective,
};
