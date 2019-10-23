import { ITemplateModule, ITemplateModuleOptions } from './interfaces';
import { TPromiseOrValue } from '@lifaon/observables';
import { IBindDirectiveParser } from '../template/generators/element-node-generator/attribute/bind/directives/interfaces';
import { ICommandParser } from '../template/generators/element-node-generator/attribute/commands/interfaces';
import { ConstructClassWithPrivateMembers } from '../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '../helpers';


/*--------------------------*/

export const TEMPLATE_MODULE_PRIVATE = Symbol('template-module-private');

export interface ITemplateModulePrivate {
  subModules: Set<ITemplateModule>;
  constantsToImport: Map<string, () => TPromiseOrValue<any>>;
  directives: Set<IBindDirectiveParser>;
  commands: Set<ICommandParser>;
}

export interface ITemplateModuleInternal extends ITemplateModule {
  [TEMPLATE_MODULE_PRIVATE]: ITemplateModulePrivate;
}

let LIGHT_CONSTRUCT: boolean = false;

export function ConstructTemplateModule(templateModule: ITemplateModule, options: ITemplateModuleOptions): void {
  ConstructClassWithPrivateMembers(templateModule, TEMPLATE_MODULE_PRIVATE);
  const privates: ITemplateModulePrivate = (templateModule as ITemplateModuleInternal)[TEMPLATE_MODULE_PRIVATE];

  if (LIGHT_CONSTRUCT) {
    Object.assign(privates, options);
  } else {
    privates.subModules = new Set<ITemplateModule>((options.subModules === void 0) ? options.subModules : []);
    privates.constantsToImport = new Map<string, () => TPromiseOrValue<any>>((options.constantsToImport === void 0) ? options.constantsToImport : []);
    privates.directives = new Set<IBindDirectiveParser>((options.directives === void 0) ? options.directives : []);
    privates.commands = new Set<ICommandParser>((options.commands === void 0) ? options.commands : []);

    for (const subModule of privates.subModules) {
      if (!(subModule instanceof TemplateModule)) {
        throw new TypeError(`Expected TemplateModule as item of options.subModules`);
      }
    }

    for (const [key, value] of privates.constantsToImport) {
      if (typeof key !== 'string') {
        throw new TypeError(`Expected string as key of options.constantsToImport`);
      }

      if (typeof value !== 'function') {
        throw new TypeError(`Expected function as value of options.constantsToImport`);
      }
    }

    for (const directive of privates.directives) {
      if (typeof directive.parse !== 'function') {
        throw new TypeError(`Expected IModuleBindDirective as item of options.directives`);
      }
    }

    for (const command of privates.commands) {
      if (typeof command.parse !== 'function') {
        throw new TypeError(`Expected IModuleCommand as item of options.commands`);
      }
    }
  }
}

export function IsTemplateModule(value: any): value is ITemplateModule {
  return IsObject(value)
    && value.hasOwnProperty(TEMPLATE_MODULE_PRIVATE);
}


export function TemplateModuleResolve(templateModule: ITemplateModule): ITemplateModule {
  const privates: ITemplateModulePrivate = (templateModule as ITemplateModuleInternal)[TEMPLATE_MODULE_PRIVATE];

  if (privates.subModules.size === 0) {
    return templateModule;
  } else {
    const options = {
      subModules: new Set<ITemplateModule>(),
      constantsToImport: new Map<string, () => TPromiseOrValue<any>>(privates.constantsToImport),
      directives: new Set<IBindDirectiveParser>(privates.directives),
      commands: new Set<ICommandParser>(privates.commands),
    };

    for (const subModule of privates.subModules) {
      for (const [key, value] of subModule.constantsToImport) {
        options.constantsToImport.set(key, value);
      }

      for (const directive of subModule.directives) {
        options.directives.add(directive);
      }

      for (const command of subModule.commands) {
        options.commands.add(command);
      }
    }

    LIGHT_CONSTRUCT = true;
    const module: ITemplateModule = new TemplateModule(options);
    LIGHT_CONSTRUCT = false;
    return module;
  }
}


export class TemplateModule implements ITemplateModule {
  constructor(options?: ITemplateModuleOptions) {
    ConstructTemplateModule(this, options);
  }

  get subModules(): ReadonlySet<ITemplateModule> {
    return ((this as unknown) as ITemplateModuleInternal)[TEMPLATE_MODULE_PRIVATE].subModules;
  }


  get constantsToImport(): ReadonlyMap<string, () => TPromiseOrValue<any>> {
    return ((this as unknown) as ITemplateModuleInternal)[TEMPLATE_MODULE_PRIVATE].constantsToImport;
  }

  get directives(): ReadonlySet<IBindDirectiveParser> {
    return ((this as unknown) as ITemplateModuleInternal)[TEMPLATE_MODULE_PRIVATE].directives;
  }

  get commands(): ReadonlySet<ICommandParser> {
    return ((this as unknown) as ITemplateModuleInternal)[TEMPLATE_MODULE_PRIVATE].commands;
  }

  resolve(): ITemplateModule {
    return TemplateModuleResolve(this);
  }

}
