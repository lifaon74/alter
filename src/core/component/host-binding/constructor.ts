import { IHostBinding } from './interfaces';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { HOST_BINDING_PRIVATE, IHostBindingInternal, IHostBindingPrivate } from './privates';
import { IHostBindingOptionsStrict, THostBindingOnResolve } from './types';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { TemplateCodeToTemplateDebuggableFunction } from '../../template/implementation';
import { TemplateGenerator } from '../../template/generators/template-generator/implementation';
import { parseAttribute } from '../../template/generators/element-node-generator/attribute/parser';
import { IAttributeGenerator } from '../../template/generators/element-node-generator/attribute/interfaces';
import { union } from '../../../misc/helpers/set-operations';
import { CommandGenerator } from '../../template/generators/element-node-generator/attribute/commands/implementation';

/** CONSTRUCTOR **/

export function ConstructHostBinding<T>(
  instance: IHostBinding<T>,
  attributeName: string,
  onResolve: THostBindingOnResolve<T>,
  options: IHostBindingOptionsStrict,
): void {
  ConstructClassWithPrivateMembers(instance, HOST_BINDING_PRIVATE);
  const privates: IHostBindingPrivate<T> = (instance as IHostBindingInternal<T>)[HOST_BINDING_PRIVATE];
  privates.attributeName = attributeName;
  privates.onResolve = onResolve;
  privates.options = options;

  const container: HTMLDivElement = document.createElement('div');
  container.innerHTML = `<div ${ attributeName }="data.value"></div>`;

  const attributeGenerator: IAttributeGenerator = parseAttribute((container.firstElementChild as HTMLElement).attributes[0], privates.options.parsers);
  if (attributeGenerator instanceof CommandGenerator) {
    throw new Error(`Commands are not allowed inside an HostBinding`);
  }
  privates.templateFunction = TemplateCodeToTemplateDebuggableFunction(
    new TemplateGenerator([attributeGenerator])
      .generate(union<string>(['node'], privates.options.constantsToImport))
  );

  privates.nodeToResolvePromiseWeakMap = new WeakMap<HTMLElement, Promise<void>>();
}

export function IsHostBinding(value: any): value is IHostBinding<any> {
  return IsObject(value)
    && value.hasOwnProperty(HOST_BINDING_PRIVATE as symbol);
}
