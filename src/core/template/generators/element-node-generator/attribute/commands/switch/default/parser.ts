import { ISwitchDefaultCommandGenerator } from './interfaces';
import { SwitchDefaultCommandGenerator } from './implementation';
import { ICommandAttribute, ICommandParser } from '../../interfaces';
import {
  ExtractDefaultSwitchChildSwitchCaseCommandAttributes, ExtractSwitchChildCommandAttribute,
  ExtractSwitchChildParentSwitchCommandAttribute, switchDefaultSelector
} from '../parser';


export function parseSwitchDefaultCommandAttribute({ name, value, modifiers, attribute }: ICommandAttribute): ISwitchDefaultCommandGenerator | null {
  if (switchDefaultSelector.test(name)) {
    ExtractSwitchChildCommandAttribute(attribute.ownerElement); // ensures 'switch-case' command is valid
    const parentSwitchCommandAttribute: ICommandAttribute = ExtractSwitchChildParentSwitchCommandAttribute(attribute.ownerElement, 'switch-case'); // ensures 'switch' parent is valid
    const switchCaseCommandAttributes: ICommandAttribute[] = ExtractDefaultSwitchChildSwitchCaseCommandAttributes(attribute.ownerElement);
    return new SwitchDefaultCommandGenerator({
      name,
      value,
      modifiers,
      priority: 1000,
      parentSwitchValue: parentSwitchCommandAttribute.value,
      parentSwitchModifiers: parentSwitchCommandAttribute.modifiers,
      switchCases: switchCaseCommandAttributes,
    });
  } else {
    return null;
  }
}

export const SwitchDefaultCommandParser: ICommandParser = {
  parse: parseSwitchDefaultCommandAttribute,
};
