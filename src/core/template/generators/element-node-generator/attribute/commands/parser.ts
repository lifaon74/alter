import { ICommandAttribute, ICommandGenerator, ICommandParser } from './interfaces';
import { HTMLTemplateError } from '../../../../HTMLTemplateError';
import { TAttributeGeneratorModifiers } from '../interfaces';

const starPattern: string = '\\*(\\$)?(.+)';
const prefixPattern: string = 'cmd-(exp-)?(.+)';
const pattern: string = `(?:${starPattern})`
  + `|(?:${prefixPattern})`;
const regExp: RegExp = new RegExp(`^${pattern}$`);


export function ExtractCommandAttribute(attribute: Attr): ICommandAttribute | null {
  const match: RegExpExecArray | null = regExp.exec(attribute.name);
  if (match === null) {
    return null;
  } else {
    const prefixMode: boolean = match[4] !== void 0;
    const name: string = prefixMode ? match[4] : match[2];
    let value: string = attribute.value.trim();

    const modifiers: Set<TAttributeGeneratorModifiers> = new Set<TAttributeGeneratorModifiers>();

    if (prefixMode) {
      modifiers.add('prefix');
    }

    if ((match[1] !== void 0) || (match[3] !== void 0)) {
      modifiers.add('expression');
    }

    return {
      name,
      value,
      modifiers,
      attribute
    };
  }
}

export function parseCommandAttribute<T extends ICommandGenerator>(attribute: Attr, commands: Iterable<ICommandParser>): ICommandGenerator | null {
  const commandAttribute: ICommandAttribute | null = ExtractCommandAttribute(attribute);
  if (commandAttribute === null) {
    return null;
  } else {
    for (const command of commands) {
      const generator: ICommandGenerator | null = command.parse(commandAttribute);
      if (generator !== null) {
        return generator as T;
      }
    }

    throw HTMLTemplateError.fromAttribute(`No command found matching '${name}'`, attribute, HTMLTemplateError.getTopParent<Element>(attribute.ownerElement));
  }
}
