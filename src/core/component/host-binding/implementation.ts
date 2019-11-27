import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import {
  IHostBinding, IHostBindingOptions, IHostBindingOptionsStrict, THostBindingOnResolve, THostBindingOnResolveResultValue
} from './interfaces';
import { ITemplateBuildOptions, TTemplateRawFunction } from '../../template/interfaces';
import { NormalizeTemplateBuildOptions } from '../../template/helpers';
import { TemplateCodeToTemplateDebuggableFunction } from '../../template/implementation';
import { parseAttribute } from '../../template/generators/element-node-generator/attribute/parser';
import { TemplateGenerator } from '../../template/generators/template-generator/implementation';
import { IsObject } from '../../../misc/helpers/is/IsObject';


/** PRIVATES **/

export const HOST_BINDING_PRIVATE = Symbol('host-binding-private');

export interface IHostBindingPrivate {
  attributeName: string;
  onResolve: THostBindingOnResolve;
  options: IHostBindingOptionsStrict;
  templateFunction: TTemplateRawFunction;
  nodeToResolvePromiseWeakMap: WeakMap<Element, Promise<void>>;
}

export interface IHostBindingPrivatesInternal {
  [HOST_BINDING_PRIVATE]: IHostBindingPrivate;
}

export interface IHostBindingInternal extends IHostBindingPrivatesInternal, IHostBinding {
}

/** FUNCTIONS **/

export function NormalizeHostBindingOptions(options: IHostBindingOptions): IHostBindingOptionsStrict {
  return NormalizeTemplateBuildOptions(options);
}


/** CONSTRUCTOR **/

export function ConstructHostBinding(instance: IHostBinding, attributeName: string, onResolve: THostBindingOnResolve, options: IHostBindingOptions = {}): void {
  ConstructClassWithPrivateMembers(instance, HOST_BINDING_PRIVATE);
  const privates: IHostBindingPrivate = (instance as IHostBindingInternal)[HOST_BINDING_PRIVATE];
  privates.attributeName = attributeName;
  privates.onResolve = onResolve;
  privates.options = NormalizeHostBindingOptions(options);

  const container: HTMLDivElement = document.createElement('div');
  container.innerHTML = `<div ${ attributeName }="data.value"></div>`;

  privates.templateFunction = TemplateCodeToTemplateDebuggableFunction(
    new TemplateGenerator([parseAttribute((container.firstElementChild as HTMLElement).attributes[0], privates.options.parsers)])
      .generate(new Set<string>(['node'].concat(Array.from(privates.options.constantsToImport))))
  );

  privates.nodeToResolvePromiseWeakMap = new WeakMap<Element, Promise<void>>();
}

export function IsHostBinding(value: any): value is IHostBinding {
  return IsObject(value)
    && value.hasOwnProperty(HOST_BINDING_PRIVATE as symbol);
}

/** METHODS **/

export function HostBindingResolve(instance: IHostBinding, node: Element): Promise<void> {
  const privates: IHostBindingPrivate = (instance as IHostBindingInternal)[HOST_BINDING_PRIVATE];
  if (!privates.nodeToResolvePromiseWeakMap.has(node)) {
    privates.nodeToResolvePromiseWeakMap.set(node,
      privates.templateFunction((name: string) => { // require function
        if (privates.options.dataSourceName.has(name)) {
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
      }).then(() => void 0)
    );
  }

  return privates.nodeToResolvePromiseWeakMap.get(node) as Promise<void>;
}

export class HostBinding implements IHostBinding {
  constructor(attributeName: string, onResolve: THostBindingOnResolve, options?: IHostBindingOptions) {
    ConstructHostBinding(this, attributeName, onResolve, options);
  }

  get attributeName(): string {
    return ((this as unknown) as IHostBindingInternal)[HOST_BINDING_PRIVATE].attributeName;
  }

  resolve(node: Element): Promise<void> {
    return HostBindingResolve(this, node);
  }
}













