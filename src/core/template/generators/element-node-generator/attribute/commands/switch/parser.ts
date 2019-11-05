import { ISwitchCommandGenerator } from './interfaces';
import { SwitchCommandGenerator } from './implementation';
import { ICommandAttribute, ICommandParser } from '../interfaces';
import { ExtractCommandAttribute } from '../parser';

const switchSelector: RegExp = new RegExp('^switch$');
export const switchCaseSelector: RegExp = new RegExp('^switch-case$');
export const switchDefaultSelector: RegExp = new RegExp('^switch-default$');

export function GenerateSwitchCommandInvalidSyntaxError(message: string): Error {
  return new Error(`Invalid syntax using the 'switch' command: ${ message }`);
}

export function GenerateSwitchChildCommandInvalidSyntaxError(commandName: string, message: string): Error {
  return new Error(`Invalid syntax using the '${ commandName }' command: ${ message }`);
}

/**
 * Extracts the ICommandAttributes of the 'switch''s children
 * Ensures valid:
 *  - every child must be of type 'switch-case' or 'switch-default': no text node, no other commands
 *  - must at least contain one child of type 'switch-case' or 'switch-default'
 *  - must contain a maximum of one child of type 'switch-default'
 * @param node
 */
export function ExtractSwitchChildrenCommandAttributes(node: Node): ICommandAttribute[] {
  const commandAttributes: ICommandAttribute[] = [];
  let childNode: Node | null = node.firstChild;
  let defaultFound: boolean = false;
  while (childNode !== null) {
    switch (childNode.nodeType) {
      case Node.TEXT_NODE:
        if ((childNode as Text).data.trim() !== '') {
          throw GenerateSwitchCommandInvalidSyntaxError('the element must not contain any text nodes');
        }
        break;
      case Node.COMMENT_NODE:
        // ok
        break;
      case Node.ELEMENT_NODE: {
        const commandAttribute: ICommandAttribute = ExtractSwitchChildCommandAttribute(childNode as Element);
        if (commandAttribute.name === 'switch-default') {
          if (defaultFound) {
            throw GenerateSwitchCommandInvalidSyntaxError(`the element may have a maximum of one 'switch-default' child`);
          }
          defaultFound = true;
        }
        commandAttributes.push(commandAttribute);
        break;
      }
      default:
        console.warn(`Unsupported node's type: '${ childNode.nodeType }'`);
        break;
    }

    childNode = childNode.nextSibling;
  }

  if (commandAttributes.length === 0) {
    throw GenerateSwitchCommandInvalidSyntaxError(`the element must contain at least a 'switch-case' or 'switch-default' child`);
  }

  return commandAttributes;
}

/**
 * Extracts the ICommandAttribute of the 'switch' parent of a 'switch-case' or 'switch-default'
 * Ensures valid:
 *  - parent must have a 'switch' command
 * @param element
 * @param commandName
 */
export function ExtractSwitchChildParentSwitchCommandAttribute(element: Element, commandName: string): ICommandAttribute {
  const parentNode: Node | null = element.parentNode;
  if ((parentNode !== null) && (parentNode.nodeType === Node.ELEMENT_NODE)) {
    for (const attribute of Array.from((parentNode as Element).attributes)) {
      const commandAttribute: ICommandAttribute | null = ExtractCommandAttribute(attribute);
      if ((commandAttribute !== null) && switchSelector.test(commandAttribute.name)) {
        return commandAttribute;
      }
    }
    throw GenerateSwitchChildCommandInvalidSyntaxError(commandName, `element's parent must have the command 'switch'`);
  } else {
    throw GenerateSwitchChildCommandInvalidSyntaxError(commandName, `element must have a parent with the command 'switch'`);
  }
}

/**
 * Extracts the ICommandAttribute of 'switch-case' or 'switch-default'
 * Ensures valid:
 *  - must have only one command: 'switch-case' or 'switch-default'
 *  - switch-default's value must be empty
 * @param element
 */
export function ExtractSwitchChildCommandAttribute(element: Element): ICommandAttribute {
  const commandAttributes: ICommandAttribute[] = Array.from(element.attributes)
    .map(attribute => ExtractCommandAttribute(attribute))
    .filter<ICommandAttribute>((commandAttribute: (ICommandAttribute | null)): commandAttribute is ICommandAttribute  => (commandAttribute !== null));

  const switchCommandAttributes: ICommandAttribute[] = commandAttributes
    .filter(commandAttribute => (switchCaseSelector.test(commandAttribute.name) || switchDefaultSelector.test(commandAttribute.name)));

  if (switchCommandAttributes.length === 0) {
    throw GenerateSwitchCommandInvalidSyntaxError(`children '${ element.tagName.toLowerCase() }' must have one of the following commands 'switch-case' or 'switch-default'`);
    // } else if (commandAttributes.length > 1) { // INFO: maybe enable any commands on a 'switch-case' or 'switch-default' as it wont impact code execution/template
    //   throw GenerateSwitchChildCommandInvalidSyntaxError(switchCommandAttributes[0].name.slice(1, -1), `element's cannot contain any other command`);
  } else {
    const commandAttribute: ICommandAttribute = switchCommandAttributes[0];
    if ((commandAttribute.name === 'switch-default') && (commandAttribute.value !== '')) {
      throw GenerateSwitchChildCommandInvalidSyntaxError('switch-default', `value should be empty`);
    } else {
      return commandAttribute;
    }
  }
}


export function ExtractDefaultSwitchChildSwitchCaseCommandAttributes(element: Element): ICommandAttribute[] {
  return ExtractSwitchChildrenCommandAttributes(element.parentNode as Element)
    .filter(commandAttribute => (commandAttribute.name === 'switch-case'));
}


export function parseSwitchCommandAttribute({ name, value, modifiers, attribute }: ICommandAttribute): ISwitchCommandGenerator | null {
  if (switchSelector.test(name)) {
    ExtractSwitchChildrenCommandAttributes(attribute.ownerElement as Element); // ensures 'switch' command is valid
    return new SwitchCommandGenerator({ name, value, modifiers, priority: 0 }); // priority is not really important
  } else {
    return null;
  }
}

export const SwitchCommandParser: ICommandParser = {
  parse: parseSwitchCommandAttribute,
};
