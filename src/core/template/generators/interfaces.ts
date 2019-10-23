import { IBindDirectiveParser } from './element-node-generator/attribute/bind/directives/interfaces';
import { ICommandParser } from './element-node-generator/attribute/commands/interfaces';

export interface IParsers {
  directives: Set<IBindDirectiveParser>;
  commands: Set<ICommandParser>;
}
