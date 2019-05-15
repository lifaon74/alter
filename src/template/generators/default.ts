import { IParsers } from './interfaces';
import { BindClassDirectiveParser } from './element-node-generator/attribute/bind/directives/class/parser';
import { BindStyleDirectiveParser } from './element-node-generator/attribute/bind/directives/style/parser';
import { BindAttributeDirectiveParser } from './element-node-generator/attribute/bind/directives/attribute/parser';
import { IfCommandParser } from './element-node-generator/attribute/commands/if/parser';
import { ForCommandParser } from './element-node-generator/attribute/commands/for/parser';

export const DefaultParsers: IParsers = {
  directives: [BindClassDirectiveParser, BindStyleDirectiveParser, BindAttributeDirectiveParser],
  commands: [IfCommandParser, ForCommandParser],
};
