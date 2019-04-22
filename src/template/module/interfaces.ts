import { IModuleBindDirective } from '../generators/element-node-generator/attribute/bind/directives/interfaces';
import { IModuleCommand } from '../generators/element-node-generator/attribute/commands/interfaces';

export interface IModule {
  directives: IModuleBindDirective[];
  commands: IModuleCommand[];
}

