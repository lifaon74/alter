import { IAttributeGenerator } from './interfaces';
import { parseStaticAttribute } from './static/parser';
import { parseBindAttribute } from './bind/parser';
import { parseCommandAttribute } from './commands/parser';
import { parseEventListenerAttribute } from './event/parser';
import { IParsers } from '../../interfaces';

export function parseAttribute(attribute: Attr, parsers: IParsers): IAttributeGenerator {
  let generator: IAttributeGenerator | null;
  if ((generator = parseBindAttribute(attribute, parsers.directives)) !== null) {
    return generator;
  } else if ((generator = parseCommandAttribute(attribute, parsers.commands)) !== null) {
    return generator;
  } else if ((generator = parseEventListenerAttribute(attribute)) !== null) {
    return generator;
  } else {
    return parseStaticAttribute(attribute);
  }
}
