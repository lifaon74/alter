import { IModule } from './interfaces';
import { ModuleBindClassDirective } from '../generators/element-node-generator/attribute/bind/directives/class/parser';
import { ModuleIfCommand } from '../generators/element-node-generator/attribute/commands/if/parser';
import { ModuleForCommand } from '../generators/element-node-generator/attribute/commands/for/parser';
import { ModuleBindStyleDirective } from '../generators/element-node-generator/attribute/bind/directives/style/parser';

export const DefaultModule: IModule = {
  directives: [ModuleBindClassDirective, ModuleBindStyleDirective],
  commands: [ModuleIfCommand, ModuleForCommand],
};

