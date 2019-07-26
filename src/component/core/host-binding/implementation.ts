import { IsObject, noop } from '../../../helpers';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import {
  IHostBinding, IHostBindingOptions, THostBindingOnResolve, THostBindingOnResolveResultValue
} from './interfaces';
import { parseAttribute } from '../../../template/generators/element-node-generator/attribute/parser';
import { ITemplateBuildOptions, TTemplateRawFunction } from '../../../template/interfaces';
import {
  NormalizeTemplateBuildOptions, TemplateCodeToTemplateDebuggableFunction
} from '../../../template/implementation';
import { TemplateGenerator } from '../../../template/generators/template-generator/implementation';


export const HOST_BINDING_PRIVATE = Symbol('host-binding-private');

export interface IHostBindingPrivate {
  attributeName: string;
  onResolve: THostBindingOnResolve;
  options: IHostBindingOptions;
  templateFunction: TTemplateRawFunction;
  nodeToResolvePromiseWeakMap: WeakMap<Element, Promise<void>>;
}

export interface IHostBindingInternal extends IHostBinding {
  [HOST_BINDING_PRIVATE]: IHostBindingPrivate;
}

export function NormalizeHostBindingOptions(options: IHostBindingOptions): IHostBindingOptions {
  return NormalizeTemplateBuildOptions(options);
}

export function ConstructHostBinding(instance: IHostBinding, attributeName: string, onResolve: THostBindingOnResolve, options: IHostBindingOptions = {}): void {
  ConstructClassWithPrivateMembers(instance, HOST_BINDING_PRIVATE);
  const privates: IHostBindingPrivate = (instance as IHostBindingInternal)[HOST_BINDING_PRIVATE];
  privates.attributeName = attributeName;
  privates.onResolve = onResolve;
  privates.options = NormalizeHostBindingOptions(options);

  const container: HTMLDivElement = document.createElement('div');
  container.innerHTML = `<div ${ attributeName }="data.value"></div>`;

  privates.templateFunction = TemplateCodeToTemplateDebuggableFunction(
    new TemplateGenerator([parseAttribute(container.firstElementChild.attributes[0], privates.options.parsers)])
      .generate(new Set<string>(['node'].concat(Array.from(privates.options.constantsToImport))))
  );

  privates.nodeToResolvePromiseWeakMap = new WeakMap<Element, Promise<void>>();
}

export function IsHostBinding(value: any): value is IHostBinding {
  return IsObject(value)
    && value.hasOwnProperty(HOST_BINDING_PRIVATE);
}


export function HostBindingResolve(instance: IHostBinding, node: Element): Promise<void> {
  const privates: IHostBindingPrivate = (instance as IHostBindingInternal)[HOST_BINDING_PRIVATE];
  if (!privates.nodeToResolvePromiseWeakMap.has(node)) {
    privates.nodeToResolvePromiseWeakMap.set(node,
      privates.templateFunction((name: string) => { // require function
        if (name === privates.options.dataSourceName) {
          return new Promise<any>((resolve: any) => {
            resolve(privates.onResolve(node));
          }).then((value: THostBindingOnResolveResultValue) => {
            return {
              value: value,
            };
          });
        } else if (name === 'node') {
          return Promise.resolve(node);
        } else {
          return privates.options.require(name);
        }
      }).then(noop)
    );
  }

  return privates.nodeToResolvePromiseWeakMap.get(node);
}

export class HostBinding implements IHostBinding {
  constructor(attributeName: string, onResolve: THostBindingOnResolve, options?: ITemplateBuildOptions) {
    ConstructHostBinding(this, attributeName, onResolve, options);
  }

  get attributeName(): string {
    return ((this as unknown) as IHostBindingInternal)[HOST_BINDING_PRIVATE].attributeName;
  }

  resolve(node: Element): Promise<void> {
    return HostBindingResolve(this, node);
  }
}













