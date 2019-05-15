import { IBindDirectiveParser } from '../template/generators/element-node-generator/attribute/bind/directives/interfaces';
import { ICommandParser } from '../template/generators/element-node-generator/attribute/commands/interfaces';
import { TPromiseOrValue } from '@lifaon/observables/public';


export interface ITemplateModuleOptions {
  subModules?: Iterable<ITemplateModule>;
  constantsToImport?: Iterable<[string, () => TPromiseOrValue<any>]>;
  directives?: Iterable<IBindDirectiveParser>;
  commands?: Iterable<ICommandParser>;
}

export interface ITemplateModuleConstructor {
  new(options?: ITemplateModuleOptions): ITemplateModule;
}

export interface ITemplateModule {
  readonly subModules: ReadonlySet<ITemplateModule>;
  readonly constantsToImport: ReadonlyMap<string, () => TPromiseOrValue<any>>;
  readonly directives: ReadonlySet<IBindDirectiveParser>;
  readonly commands: ReadonlySet<ICommandParser>;

  resolve(): ITemplateModule;
}
