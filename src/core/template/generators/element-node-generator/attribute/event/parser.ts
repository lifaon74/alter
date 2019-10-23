import { IEventListenerGenerator } from './interfaces';
import { EventListenerGenerator } from './implementation';
import { TAttributeGeneratorModifiers } from '../interfaces';


const parenthesisPattern: string = '\\((\\$)?([^\\]]+)\\)';
const prefixPattern: string = 'on-(exp-)?(.+)';
const pattern: string = `(?:${parenthesisPattern})`
  + `|(?:${prefixPattern})`;
const regExp: RegExp = new RegExp(`^${pattern}$`);

export function parseEventListenerAttribute<T extends IEventListenerGenerator>(attribute: Attr): T | null {
  const match: RegExpExecArray | null = regExp.exec(attribute.name);
  if (match === null) {
    return null;
  } else {
    const prefixMode: boolean = (match[4] !== void 0);
    const name: string = prefixMode ? match[4] : match[2];
    let value: string = attribute.value.trim();

    const modifiers: Set<TAttributeGeneratorModifiers> = new Set<TAttributeGeneratorModifiers>();

    if (prefixMode) {
      modifiers.add('prefix');
    }

    if ((match[1] !== void 0) || (match[3] !== void 0)) {
      modifiers.add('expression');
    }

    if (!(('on' + name) in attribute.ownerElement)) {
      console.warn(`Event '${name}' probably doesn't exist on node '${attribute.ownerElement.tagName}'`);
    }

    return new EventListenerGenerator({ name, value, modifiers }) as any;
  }
}

