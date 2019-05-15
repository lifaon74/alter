import { IBindDirectiveParser } from './element-node-generator/attribute/bind/directives/interfaces';
import { ICommandParser } from './element-node-generator/attribute/commands/interfaces';

export interface IParsers {
  directives: IBindDirectiveParser[];
  commands: ICommandParser[];
}
