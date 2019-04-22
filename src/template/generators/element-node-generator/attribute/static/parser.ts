import { IAttributeGenerator } from '../interfaces';
import { StaticAttributeGenerator } from './implementation';

export function parseStaticAttribute(attribute: Attr): IAttributeGenerator {
  return new StaticAttributeGenerator(attribute);
  // return new StaticAttributeGenerator({ name: attribute.name, value: attribute.value });
}
