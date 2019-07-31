import { IParsers } from './interfaces';
import { BindClassDirectiveParser } from './element-node-generator/attribute/bind/directives/class/parser';
import { BindStyleDirectiveParser } from './element-node-generator/attribute/bind/directives/style/parser';
import { BindAttributeDirectiveParser } from './element-node-generator/attribute/bind/directives/attribute/parser';
import { IfCommandParser } from './element-node-generator/attribute/commands/if/parser';
import { ForCommandParser } from './element-node-generator/attribute/commands/for/parser';
import { IBindDirectiveParser } from './element-node-generator/attribute/bind/directives/interfaces';
import { ICommandParser } from './element-node-generator/attribute/commands/interfaces';
import { SwitchCommandParser } from './element-node-generator/attribute/commands/switch/parser';
import { SwitchCaseCommandParser } from './element-node-generator/attribute/commands/switch/case/parser';
import { SwitchDefaultCommandParser } from './element-node-generator/attribute/commands/switch/default/parser';

export const DefaultParsers: IParsers = {
  directives: new Set<IBindDirectiveParser>([
    BindClassDirectiveParser,
    BindStyleDirectiveParser,
    BindAttributeDirectiveParser
  ]),
  commands: new Set<ICommandParser>([
    IfCommandParser,
    ForCommandParser,
    SwitchCommandParser,
    SwitchCaseCommandParser,
    SwitchDefaultCommandParser,
  ]),
};
