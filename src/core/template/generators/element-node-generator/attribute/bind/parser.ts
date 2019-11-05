import { IBindGenerator } from './interfaces';
import { BindPropertyGenerator } from './property/implementation';
import { IBindDirectiveGenerator, IBindDirectiveParser } from './directives/interfaces';
import { TAttributeGeneratorModifiers } from '../interfaces';

const bracketPattern: string = '\\[(\\$)?([^\\]]+)\\]';
const prefixPattern: string = 'bind-(exp-)?(.+)';
const pattern: string = `(?:${ bracketPattern })`
  + `|(?:${ prefixPattern })`;
const regExp: RegExp = new RegExp(`^${ pattern }$`);

export function parseBindAttribute<T extends IBindGenerator>(attribute: Attr, directives: Iterable<IBindDirectiveParser>): T | null {
  const match: RegExpExecArray | null = regExp.exec(attribute.name);
  if (match === null) {
    return null;
  } else {
    const prefixMode: boolean = (match[4] !== void 0);
    const name: string = prefixMode ? match[4] : match[2];
    const value: string = attribute.value.trim();

    const modifiers: Set<TAttributeGeneratorModifiers> = new Set<TAttributeGeneratorModifiers>();

    if (prefixMode) {
      modifiers.add('prefix');
    }

    if ((match[1] !== void 0) || (match[3] !== void 0)) {
      modifiers.add('expression');
    }

    const iterator: Iterator<IBindDirectiveParser> = directives[Symbol.iterator]();
    let result: IteratorResult<IBindDirectiveParser>;
    while (!(result = iterator.next()).done) {
      const generator: IBindDirectiveGenerator | null = result.value.parse(name, value, modifiers);
      if (generator !== null) {
        return generator as T;
      }
    }

    if (!(name in (attribute.ownerElement as Element))) {
      console.warn(`Property '${ name }' probably doesn't exist on node '${ (attribute.ownerElement as Element).tagName }'`);
    }

    return new BindPropertyGenerator({ name, value, modifiers }) as T;
  }
}
