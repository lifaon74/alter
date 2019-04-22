import { IModule } from '../../../module/interfaces';
import { IAttributeGenerator } from './interfaces';
import { parseStaticAttribute } from './static/parser';
import { parseBindAttribute } from './bind/parser';
import { parseCommandAttribute } from './commands/parser';
import { parseEventListenerAttribute } from './event/parser';

export function parseAttribute(attribute: Attr, module: IModule): IAttributeGenerator {
  let generator: IAttributeGenerator;
  if ((generator = parseBindAttribute(attribute, module)) !== null) {
    return generator;
  } else if ((generator = parseCommandAttribute(attribute, module)) !== null) {
    return generator;
  } else if ((generator = parseEventListenerAttribute(attribute)) !== null) {
    return generator;
  } else {
   return parseStaticAttribute(attribute);
  }
}
