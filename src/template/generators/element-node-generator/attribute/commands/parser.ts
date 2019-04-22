import { ICommandGenerator } from './interfaces';
import { IModule } from '../../../../module/interfaces';
import { HTMLTemplateError } from '../../../../HTMLTemplateError';
import { TAttributeGeneratorModifiers } from '../interfaces';

const starPattern: string = '\\*(\\$)?(.+)';
const prefixPattern: string = 'cmd-(exp-)?(.+)';
const pattern: string = `(?:${starPattern})`
  + `|(?:${prefixPattern})`;
const regExp: RegExp = new RegExp(`^${pattern}$`);


export function parseCommandAttribute<T extends ICommandGenerator>(attribute: Attr, module: IModule): ICommandGenerator | null {
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

    for (const command of module.commands) {
      const generator: ICommandGenerator | null = command.parse(name, value, modifiers);
      if (generator !== null) {
        return generator as T;
      }
    }

    throw HTMLTemplateError.fromAttribute(`No command found matching '${name}'`, attribute, HTMLTemplateError.getTopParent<Element>(attribute.ownerElement));
  }
}
