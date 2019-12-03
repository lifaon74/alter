import { IHostBinding } from './interfaces';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { HOST_BINDING_PRIVATE, IHostBindingInternal, IHostBindingPrivate } from './privates';
import { IHostBindingOptions, THostBindingOnResolve } from './types';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { TemplateCodeToTemplateDebuggableFunction } from '../../template/implementation';
import { TemplateGenerator } from '../../template/generators/template-generator/implementation';
import { parseAttribute } from '../../template/generators/element-node-generator/attribute/parser';
import { NormalizeHostBindingOptions } from './functions';

/** CONSTRUCTOR **/

export function ConstructHostBinding<T>(
  instance: IHostBinding<T>,
  attributeName: string,
  onResolve: THostBindingOnResolve<T>,
  options: IHostBindingOptions = {}
): void {
  ConstructClassWithPrivateMembers(instance, HOST_BINDING_PRIVATE);
  const privates: IHostBindingPrivate<T> = (instance as IHostBindingInternal<T>)[HOST_BINDING_PRIVATE];
  privates.attributeName = attributeName;
  privates.onResolve = onResolve;
  privates.options = NormalizeHostBindingOptions(options);

  const container: HTMLDivElement = document.createElement('div');
  container.innerHTML = `<div ${ attributeName }="data.value"></div>`;

  // TODO: check if allowing 'commands' is pertinent
  privates.templateFunction = TemplateCodeToTemplateDebuggableFunction(
    new TemplateGenerator([parseAttribute((container.firstElementChild as HTMLElement).attributes[0], privates.options.parsers)])
      .generate(new Set<string>(['node'].concat(Array.from(privates.options.constantsToImport))))
  );

  privates.nodeToResolvePromiseWeakMap = new WeakMap<Element, Promise<void>>();
}

export function IsHostBinding(value: any): value is IHostBinding<any> {
  return IsObject(value)
    && value.hasOwnProperty(HOST_BINDING_PRIVATE as symbol);
}
