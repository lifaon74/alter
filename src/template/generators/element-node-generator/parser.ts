import { IElementNodeGenerator, TElementNodeGeneratorChildren } from './interfaces';
import { parseText } from '../text-node-generator/parser';
import { ElementNodeGenerator } from './implementation';
import { parseAttribute } from './attribute/parser';
import { IParsers } from '../interfaces';


export function parseChildNodes(node: Node, parsers: IParsers): TElementNodeGeneratorChildren[] {
  const children: TElementNodeGeneratorChildren[] = [];
  let childNode: Node | null = node.firstChild;
  while (childNode !== null) {
    switch (childNode.nodeType) {
      case Node.TEXT_NODE:
        let text: string = (childNode as Text).data;
        childNode = childNode.nextSibling;
        while ((childNode !== null) && (childNode.nodeType === Node.TEXT_NODE)) {
          text += (childNode as Text).data;
        }
        children.push(...parseText(text));
        continue; // implicit while continue
      case Node.COMMENT_NODE:
        // TODO
        break;
      case Node.ELEMENT_NODE:
        children.push(parseElementNode(childNode as Element, parsers));
        break;
      default:
        console.warn(`Unsupported node's type: '${childNode.nodeType}'`);
        break;
    }

    childNode = childNode.nextSibling;
  }
  return children;
}

export function parseElementNode(node: Element, parsers: IParsers): IElementNodeGenerator {
  const generator: IElementNodeGenerator = new ElementNodeGenerator(node.tagName.toLowerCase());

  for (const attribute of Array.from(node.attributes)) {
    generator.attributes.push(parseAttribute(attribute, parsers));
  }

  generator.children.push(...parseChildNodes(node, parsers));

  return generator;
}
