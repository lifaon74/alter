import { IBindClassDirectiveGenerator } from './interfaces';
import { BindClassDirectiveGenerator } from './implementation';
import { IBindDirectiveParser } from '../interfaces';
import { TAttributeGeneratorModifiers } from '../../../interfaces';
import { IsValidCSSIdentifier } from '../../../../../../../tokenizers/css';

const standardSelector: RegExp = new RegExp('^class\\.(.*)$');
const prefixSelector: RegExp = new RegExp('^class-(.*)');

export function parseBindClassDirective<T extends IBindClassDirectiveGenerator>(name: string, value: string, modifiers: Set<TAttributeGeneratorModifiers>): T | null {
  const prefixMode: boolean = modifiers.has('prefix');
  const match: RegExpExecArray | null = prefixMode
    ? prefixSelector.exec(name)
    : standardSelector.exec(name);

  if (match === null) {
    return null;
  } else {
    let className: string = match[1];
    if (prefixMode ? (className === '--') : (className === '..')) {
      className = '..';
    } else if (!IsValidCSSIdentifier(className)) {
      throw new Error(`Invalid className '${ className }'`);
    }

    return new BindClassDirectiveGenerator({ name, value, className, modifiers }) as any;
  }
}

export const BindClassDirectiveParser: IBindDirectiveParser = {
  parse: parseBindClassDirective,
};
