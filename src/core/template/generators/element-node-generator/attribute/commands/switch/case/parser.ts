import { ISwitchCaseCommandGenerator } from './interfaces';
import { SwitchCaseCommandGenerator } from './implementation';
import { ICommandAttribute, ICommandParser } from '../../interfaces';
import {
  ExtractSwitchChildCommandAttribute, ExtractSwitchChildParentSwitchCommandAttribute, switchCaseSelector
} from '../parser';


export function parseSwitchCaseCommandAttribute({ name, value, modifiers, attribute }: ICommandAttribute): ISwitchCaseCommandGenerator | null {
  if (switchCaseSelector.test(name)) {
    const ownerElement: Element = attribute.ownerElement as Element;
    ExtractSwitchChildCommandAttribute(ownerElement); // ensures 'switch-case' command is valid
    const parentSwitchCommandAttribute: ICommandAttribute = ExtractSwitchChildParentSwitchCommandAttribute(ownerElement, 'switch-case'); // ensures 'switch' parent is valid
    return new SwitchCaseCommandGenerator({
      name,
      value,
      modifiers,
      priority: 1000,
      parentSwitchValue: parentSwitchCommandAttribute.value,
      parentSwitchModifiers: parentSwitchCommandAttribute.modifiers,
    });
  } else {
    return null;
  }
}

export const SwitchCaseCommandParser: ICommandParser = {
  parse: parseSwitchCaseCommandAttribute,
};
