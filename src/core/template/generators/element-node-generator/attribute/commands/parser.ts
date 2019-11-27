import { ICommandAttribute, ICommandGenerator, ICommandParser } from './interfaces';
import { GetTopParentElementOfNode, HTMLTemplateError } from '../../../../others/HTMLTemplateError';
import { TAttributeGeneratorModifiers } from '../interfaces';

const starPattern: string = '\\*(\\$)?(.+)';
const prefixPattern: string = 'cmd-(exp-)?(.+)';
const pattern: string = `(?:${ starPattern })`
  + `|(?:${ prefixPattern })`;
const regExp: RegExp = new RegExp(`^${ pattern }$`);


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
    const iterator: Iterator<ICommandParser> = commands[Symbol.iterator]();
    let result: IteratorResult<ICommandParser>;
    while (!(result = iterator.next()).done) {
      const generator: ICommandGenerator | null = result.value.parse(commandAttribute);
      if (generator !== null) {
        return generator as T;
      }
    }

    throw HTMLTemplateError.fromAttribute(`No command found matching '${ name }'`, attribute, GetTopParentElementOfNode<Element>(attribute.ownerElement as Element));
  }
}
